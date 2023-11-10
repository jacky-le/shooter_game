const canvas = document.querySelector('canvas')
canvas.width = innerWidth, canvas.height = innerHeight

const WIDTH = canvas.width
const HEIGHT = canvas.height

const c = canvas.getContext('2d')
const x = WIDTH / 2, y = HEIGHT / 2

const scoreSpan = document.querySelector('#scoreSpan')
const buffSpan = document.querySelector('#buffSpan')
const btnSpan = document.querySelector('#btnSpan')
const startSpan = document.querySelector('#startSpan')
const pointSpan = document.querySelector('#pointSpan')
const timerSpan = document.querySelector('#timerSpan')

let timer = 0
let count = 0

class Player {
    constructor({x, y, radius, color}) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color

        this.buffNum = 0
        this.canDash = 0
        this.explode = 0
        this.speedShot = 1
        this.iframe = 0
        this.reverseShot = 0
    }

    draw() {
        c.save()
        c.shadowBlur = 10
        c.shadowColor = (this.canDash > 0) ? 'gray' : 'green'
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        //c.fillStyle = this.color
        c.fillStyle = (this.explode > 0) ? this.color : 'lightgreen'
        c.fill()
        c.restore()
    }

}

class Projectile {
    constructor({x, y, radius, color, angle}) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.angle = angle
        this.speed = {
            x: Math.cos(angle) * 5 * player.speedShot,
            y: Math.sin(angle) * 5 * player.speedShot
        }
        this.amplitude = .5
        this.frequency = 0.25
    }

    draw() {
        c.save()
        //c.shadowBlur = 10
        //c.shadowColor = this.color
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.x += this.speed.x
        this.y += this.speed.y
        this.angle += this.frequency
        this.x += this.amplitude * Math.cos(this.angle)
        this.y += this.amplitude * Math.sin(this.angle)
    }
}

class Enemy {
    constructor({x, y, radius, color, speed}) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.speed = speed
    }

    shrink() {
        gsap.to(this, {duration: 0.4, radius: this.radius - 13})
    }

    draw() {
        //c.save()
        c.beginPath()
        //c.shadowBlur = 5
        //c.shadowColor = this.color
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        //c.restore()
    }

    update() {
        this.draw()
        if(this.radius <= 10) {
            if(this.color == 'rgb(50,50,50)') {
                player.buffNum = 15
                power()
            }
            else if(this.color == 'rgb(250,250,250)') {
                if(player.speedShot<10) {player.speedShot += 0.2}
                power()
            }
            else if(this.color == 'rgb(150,0,0)') {
                player.reverseShot = 20
                power()
            }
            for(let i=0; i<10; i++) {
                const speed = {
                    x: (Math.random() - 0.5) * (Math.random()*6), 
                    y: (Math.random() - 0.5) * (Math.random()*6)
                }
                particles.push(new Particle(this.x, this.y, Math.random() + 1, this.color,speed))
            }
            const index = enemies.indexOf(this)
            enemies.splice(index, 1)
            score += Math.floor(10*this.radius)
            scoreSpan.innerHTML = score
            death()
        }
        this.x += this.speed.x
        this.y += this.speed.y
    }
}

class Particle {
    constructor(x, y, radius, color, speed) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.speed = speed
        this.alpha = 1
        this.friction = .993
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        // c.shadowBlur = 5
        // c.shadowColor = this.color
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.speed.x *= this.friction
        this.speed.y *= this.friction
        this.x += this.speed.x
        this.y += this.speed.y
        this.alpha -= 0.005
    }
}

let player = new Player({
    x,
    y,
    radius: 10,
    color: 'white'
})
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player({
        x,
        y,
        radius: 10,
        color: 'white'
    })
    projectiles = []
    enemies = []
    particles = []
    score = 0
    timer = 0
    count = 0
    scoreSpan.innerHTML = score
    buffSpan.innerHTML = player.buffNum
    music()
}

let enemySpawnId
function spawnEnemies() {
    count++
    let randR = Math.floor(Math.random() * 15 + 15)
    let color = `hsl(${Math.random() * 360}, 50%, 50%)`
    let randX
    let randY
    if(Math.random() < 0.5) {
        randX = Math.random() < 0.5 ? 0 - randR : WIDTH + randR
        randY = Math.random() * HEIGHT
    }
    else {
        randX = Math.random() * WIDTH
        randY = Math.random() < 0.5 ? 0 - randR : HEIGHT + randR
    }
    const angle = Math.atan2(player.y - randY, player.x - randX)
    const speed = {x: Math.cos(angle), y: Math.sin(angle)}
    if(count % 10 == 0) {
        randR = Math.floor(Math.random() * 50 + 50)
        color = 'rgb(50,50,50)'
    }
    if(count % 20 == 0) {
        randR = Math.floor(Math.random() * 75 + 50)
        color = 'rgb(250,250,250)'
    }
    if(count % 50 == 0) {
        randR = Math.floor(Math.random() * 150 + 100)
        color = 'rgb(150,0,0)'
        speed.x *= 0.6, speed.y *= 0.6
        evil()
    }
    enemies.push(new Enemy({x:randX, y:randY, radius:randR, color:color, speed:speed}))
    let spawnInterval = 1000
    const maxSpawnRate = 100
    if(spawnInterval > maxSpawnRate) {(spawnInterval - timer*10 < maxSpawnRate) ? spawnInterval = maxSpawnRate : spawnInterval -= timer*10}
    enemySpawnId = setTimeout(() => {
        spawnEnemies()
    }, spawnInterval);
    //console.log(spawnInterval)
}

let debuffId
function debuff() {
    debuffId = setInterval(() => {
        if(player.buffNum > 0) {player.buffNum--}
        if(player.canDash > 0) {player.canDash--}
        if(player.explode > 0) {player.explode--}
        if(player.iframe > 0) {player.iframe--}
        if(player.reverseShot > 0) {player.reverseShot--}
    }, 1000);
}

let clockId
function clock() {
    clockId = setInterval(() => {
        timer += 1
    }, 1000);
}


let animationID
let score = 0
function animate() {
    animationID = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, WIDTH, HEIGHT)
    player.draw()
    buffSpan.innerHTML = player.buffNum
    timerSpan.innerHTML = timer
    if(player.buffNum <= 0) {
        player.buff = false
        color = 'white'
    }
    projectiles.forEach((projectile, projIndex) => {
        projectile.update()
        if(projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > WIDTH ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > HEIGHT) {
            setTimeout(() => {
                projectiles.splice(projIndex, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy, index) => {
        enemy.update()
        // Enemy & player collision
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - enemy.radius - player.radius < 1 && !player.iframe) {
            bgm.pause()
            bgm.currentTime = 0
            clearInterval(clockId)
            clearInterval(enemySpawnId)
            clearInterval(debuffId)
            lose()
            cancelAnimationFrame(animationID)
            pointSpan.innerHTML = score
            startSpan.style.display = 'flex'
        }
        // Enemy & projectile collision
        projectiles.forEach((projectile, projIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if(dist - enemy.radius - projectile.radius < 1) {
                for(let i=0; i<enemy.radius/4; i++) {
                    const speed = {
                        x: (Math.random() - 0.5) * (Math.random()*3), 
                        y: (Math.random() - 0.5) * (Math.random()*3)}
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() + 1, enemy.color,speed))
                }
                //slap()
                setTimeout(() => {
                    enemy.shrink()
                    projectiles.splice(projIndex, 1)
                }, 0)
            }
        })
        // Enemy cleanup
        if(enemy.x + enemy.radius < 0 ||
            enemy.x - enemy.radius > WIDTH ||
            enemy.y + enemy.radius < 0 ||
            enemy.y - enemy.radius > HEIGHT) {
            setTimeout(() => {
                enemies.splice(index, 1)
            }, 0)
        }
    })
    particles.forEach((particle, index) => {
        particle.update()
        if(particle.alpha <= 0) {
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0)
        }
    })
    let SPEED = 2
    if(keys.w.pressed) {
        player.y -= SPEED
    }

    if(keys.a.pressed) {
        player.x -= SPEED
    }

    if(keys.s.pressed) {
        player.y += SPEED
    }

    if(keys.d.pressed) {
        player.x += SPEED
    }

    if(keys.f.pressed) {
        if(player.explode == 0) {
            explode()
            player.explode = 3
            for(let i=0; i<=Math.PI*2; i += Math.PI/18) {
                projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color: (player.buffNum > 0) ? `hsl(${Math.random() * 360}, 50%, 50%)` : 'white', angle:i}))
            }
            if(player.buffNum > 0) {
                setTimeout(() => {
                    explode()
                    for(let i=0; i<=Math.PI*2; i += Math.PI/18) {
                        projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color: (player.buffNum > 0) ? `hsl(${Math.random() * 360}, 50%, 50%)` : 'white', angle:i}))
                    }
                }, 175);
            }
        }
    }

    if(keys.space.pressed) {
        const dashNum = 10
        let x = 0, y = 0
        if(keys.w.pressed) {
            y -= dashNum
        }
    
        if(keys.a.pressed) {
            x -= dashNum
        }
    
        if(keys.s.pressed) {
            y += dashNum
        }
    
        if(keys.d.pressed) {
            x += dashNum
        }
        if(x != 0 && y != 0) {
            x *= 0.7
            y *= 0.7
        }
        
        if(player.canDash == 0 && (x != 0 || y != 0)) {
            player.iframe = 1
            gsap.to(player, {x: player.x += x, y: player.y +=y, duration:0.01 }) 
            setTimeout(() => {
                
                player.canDash = 3
            }, 100);
        }
    }
}

// Shoot on click
function shoot() {
    const blaster = new Audio()
    blaster.src = "./blaster.wav"
    blaster.volume = 0.02
    blaster.play()
}

function dash() {
    const dash = new Audio()
    dash.src = "./dash.wav"
    dash.volume = 0.1
    dash.play()
}

function death() {
    const die = new Audio()
    const hurt = new Audio()
    die.src = "./scream.mp3"
    die.volume = 0.01
    hurt.src = "./ouch.mp3"
    hurt.volume = 0.01
    Math.random() < 0.5 ? die.play() : hurt.play()
}

function lose() {
    const lose = new Audio()
    lose.src = "./test.ogg"
    lose.volume = 0.05
    lose.play()
}

function slap() {
    const slap = new Audio()
    slap.src = "./slap.mp3"
    slap.volume = 0.01
    slap.play()
}

function power() {
    const power = new Audio()
    power.src = "./ohyeah.ogg"
    power.volume = 0.2
    power.play()
}

function evil() {
    const evil = new Audio()
    evil.src = "./evil.mp3"
    evil.volume = 0.1
    evil.play()
}

function explode() {
    const explode = new Audio()
    explode.src = "./explosion.wav"
    explode.volume = 0.07
    explode.play()
}

let bgm
function music() {
    bgm = new Audio()
    bgm.src = "./bgm.mp3"
    bgm.volume = 0.05
    bgm.play()
    bgm.addEventListener('ended', () => {
        bgm.currentTime = 0
        bgm.play()
    })
}

let angle
let color = 'white'
const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false},
    space: {pressed: false},
    f: {pressed: false}
}
addEventListener("mousemove", (event) => {
    if(player.buffNum > 0) {color = `hsl(${Math.random() * 360}, 50%, 50%)`}
    angle = Math.atan2(event.clientY - player.y, event.clientX - player.x)
})

addEventListener("click", () => {
    //console.log(enemies)
    projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle}))
    if(player.reverseShot > 0) {projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle+Math.PI}))}
    shoot()
    if(player.buffNum > 0) {
        setTimeout(() => {
            projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle += Math.PI/36}))
            if(player.reverseShot > 0) {projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle+Math.PI}))}
            //shoot()
        }, 75);

        setTimeout(() => {
            projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle -= Math.PI/36}))
            if(player.reverseShot > 0) {projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle+Math.PI}))}
            //shoot()
        }, 150);
    }
})

addEventListener("mousedown", () => {
    shooting = setInterval(() => {
        projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle}))
        if(player.reverseShot > 0) {projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle+Math.PI}))}
        shoot() 
        if(player.buffNum > 0) {
            setTimeout(() => {
                projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle + Math.PI/36}))
                if(player.reverseShot > 0) {projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle+Math.PI+ Math.PI/36}))}
                //shoot()
            }, 75);
    
            setTimeout(() => {
                projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle - Math.PI/36}))
                if(player.reverseShot > 0) {projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle-Math.PI- Math.PI/36}))}
                //shoot()
            }, 150);
        }
    }, 100);
})

addEventListener("mouseup", () => {
    clearInterval(shooting)
})



addEventListener("keydown", (event) => {
    switch(event.key) {
        
        case 'w':
            keys.w.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case ' ':
            if(player.canDash == 0) {dash()}
            keys.space.pressed = true
            break
        case 'f':
            keys.f.pressed = true
            break
    }
})

addEventListener('keyup', (event) => {

    switch(event.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case ' ':
            keys.space.pressed = false
            break
        case 'f':
            keys.f.pressed = false
            break
    }
})


btnSpan.addEventListener('click', ()=> {
    init()
    animate()
    spawnEnemies()
    debuff()
    clock()
    startSpan.style.display = 'none'
})
