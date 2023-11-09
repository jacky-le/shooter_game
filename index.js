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

class Player {
    constructor({x, y, radius, color}) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color

        this.buff = false
    }

    draw() {
        c.save()
        c.shadowBlur = 5
        c.shadowColor = 'gray'
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
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
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }
        this.amplitude = .5
        this.frequency = 0.25
    }

    draw() {
        c.save()
        c.shadowBlur = 10
        c.shadowColor = this.color
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
                let intervalId
                clearInterval(intervalId)
                player.buff = true
                buffNum = 15
                power()
                intervalId = setInterval(() => {
                    buffNum -= 1
                    if(buffNum <= 0) {
                        buffNum = 0
                        clearInterval(intervalId)
                    }
                }, 2000);
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
    scoreSpan.innerHTML = score
    buffNum = 0
    buffSpan.innerHTML = buffNum
}

function spawnEnemies() {
    setInterval(() => {
        const randR = Math.floor(Math.random() * 15 + 15)
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
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
        const angle = Math.atan2(HEIGHT/2 - randY, WIDTH/2 - randX)
        const speed = {x: Math.cos(angle), y: Math.sin(angle)}
        enemies.push(new Enemy({x:randX, y:randY, radius:randR, color:color, speed:speed}))
    }, (2000 - score/10))
}

let animationID
let score = 0
let buffNum = 0
function animate() {
    animationID = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, WIDTH, HEIGHT)
    player.draw()
    buffSpan.innerHTML = buffNum
    if(!buffNum) {
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
        if(dist - enemy.radius - player.radius < 1) {
            lose()
            cancelAnimationFrame(animationID)
            pointSpan.innerHTML = score
            startSpan.style.display = 'flex'
        }
        // Enemy & projectile collision
        projectiles.forEach((projectile, projIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if(dist - enemy.radius - projectile.radius < 1) {
                for(let i=0; i<enemy.radius; i++) {
                    const speed = {
                        x: (Math.random() - 0.5) * (Math.random()*3), 
                        y: (Math.random() - 0.5) * (Math.random()*3)}
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() + 1, enemy.color,speed))
                }
                slap()
                setTimeout(() => {
                    enemy.shrink()
                    projectiles.splice(projIndex, 1)
                }, 0)
            }
        })
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
}

// Shoot on click
function shoot() {
    const blaster = new Audio()
    blaster.src = "./blaster.mp3"
    blaster.volume = 0.05
    blaster.play()
}

function death() {
    const die = new Audio()
    const hurt = new Audio()
    die.src = "./scream.mp3"
    die.volume = 0.1
    hurt.src = "./ouch.mp3"
    hurt.volume = 0.05
    Math.random() < 0.5 ? die.play() : hurt.play()
}

function lose() {
    const lose = new Audio()
    lose.src = "./lose.mp3"
    lose.volume = 0.05
    lose.play()
}

function slap() {
    const slap = new Audio()
    slap.src = "./slap.mp3"
    slap.volume = 0.05
    slap.play()
}

function power() {
    const power = new Audio()
    power.src = "./power.mp3"
    power.volume = 0.1
    power.play()
}


let angle
let color = 'white'
const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false}
}
addEventListener("mousemove", (event) => {
    if(player.buff) {color = `hsl(${Math.random() * 360}, 50%, 50%)`}
    angle = Math.atan2(event.clientY - player.y, event.clientX - player.x)
})

addEventListener("click", () => {
    projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle}))
    shoot()
    if(player.buff) {
        setTimeout(() => {
            projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle += Math.PI/36}))
            shoot()
        }, 75);

        setTimeout(() => {
            projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle -= Math.PI/36}))
            shoot()
        }, 150);
    }
})

addEventListener("mousedown", () => {
    shooting = setInterval(() => {
        projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle}))
        shoot() 
        if(player.buff) {
            setTimeout(() => {
                projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle += Math.PI/36}))
                shoot()
            }, 75);
    
            setTimeout(() => {
                projectiles.push(new Projectile({x:player.x,y:player.y,radius:5,color:color, angle:angle -= Math.PI/36}))
                shoot()
            }, 150);
        }
    }, 100);
})

addEventListener("mouseup", () => {
    clearInterval(shooting)
})

addEventListener("keydown", (event) => {
    if(event.key == " ") {
        const randR = Math.floor(Math.random() * 50 + 50)
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
        const angle = Math.atan2(HEIGHT/2 - randY, WIDTH/2 - randX)
        const speed = {x: Math.cos(angle), y: Math.sin(angle)}
        enemies.push(new Enemy({x:randX, y:randY, radius:randR, color:'rgb(50,50,50)', speed:speed}))
    }
    
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
    }
})



btnSpan.addEventListener('click', ()=> {
    init()
    animate()
    spawnEnemies()
    startSpan.style.display = 'none'
})
