(function() {

    /*=============================================================================*/
    /* Configuration                                                               */
    /*=============================================================================*/

    var cfg = {

        runner: {
            fps: FPS,
            stats: true
        },

        state: {
            initial: 'booting',
            inputs: {
                double: false,
                pressed: false,
                held: false,
                released: false
            },
            events: [
                { name: 'playing' }
            ]
        },

        images: [
            "player",
            "ground"
        ],

        sounds: [
            { id: 'sound', name: 'sounds/music', formats: ['mp3', 'ogg', 'wav'], volume: 1.0, loop: true },
            { id: 'sound', name: 'sounds/sfx', formats: ['mp3', 'ogg', 'wav'], volume: 1.0, loop: true }
        ],

        levels: {
            test: 'levels/test'
        },

        projectile: {
            'rainbowBlast': {
                'speed': 6,
                'partCount': 3,
                'accel': 9 / 100,
                'partSpeed': 1,
                'hue': [0, 36, 10],
                'partSpeedVar': 2,
                'alpha': 100,
                'partWind': 50,
                'brightness': 50,
                'partFriction': 5,
                'lineWidth': 3,
                'partGravity': 0,
                'radius': 8,
                'partAlpha': 25,
                'partLineWidth': 3,
                'hueVar': [1, 2, 10],
                'flicker': 20,
                'reload': 9,
                'angle': [0, 360],
                'automatic': false
            },
            'default': {
                'speed': 4,
                'partCount': 3,
                'accel': 0,
                'partSpeed': 1 / 10,
                'hue': 50,
                'partSpeedVar': 1,
                'alpha': 50,
                'partWind': 1,
                'brightness': 50,
                'partFriction': 1,
                'lineWidth': 4,
                'partGravity': 1,
                'radius': 6,
                'partAlpha': 50,
                'partLineWidth': 1,
                'hueVar': 0,
                'flicker': 20,
                'reload': 15,
                'angle': [0, 360],
                'automatic': false
            }
        },

        weapon: [
            { type: 'short sword', name: 'short sword', pp: '2' }
        ],

        pickup: [],

        animation: {
            'player': {
                'STANDING': { x: 0, y: 0, w: 21, h: 28, frames: 1, fps: 30 },
                'WALKING': [],
                'RUNNING': [],

                'FJUMPH': [],
                'FJUMPM': [],
                'FJUMPL': [],

                'highBackwardJump': [],
                'midBackwardJump': [],
                'lowBackwardJump': [],
                'startJump': [],
                'neutralJump': [],
                'wallJump': [],
                'land': [],

                'aim': [],
                'highAim': [],
                'lowAim': [],
                'upAim': [],
                'downAim': [],
                'ledgeAim': [],

                'ledgeAimUp': [],
                'ledgeAimDown': [],
                'ledgeHighAimFoward': [],
                'ledgeLowAimFoward': [],
                'ledgeHighAimBackward': [],
                'ledgeLowAimBackward': [],
                'grabLedge': [],
                'LEDGE': [],
                'ledgeRecover': [],

                'neutralAttack': [],
                'fowardAttack': [],
                'runningAttack': [],
                'strongAttack': [],
                'downAttack': [],
                'upAttack': [],
                'airNeutralAttack': [],
                'airFowardAttack': [],
                'airDownAttack': [],
                'airUpAttack': [],
                'ledgeNeutralAttack': [],
                'ledgeUpAttack': [],
                'ledgeDownAttack': [],

                'hurt': [],
                'hurtLand': [],
                'hurtFoward': [],
                'slam': [],
                'slamFoward': [],
                'slamBackward': [],
                'dodge': [],
                'dodgeFoward': [],
                'dodgeBackward': [],

                'blocking': [],
                'blocked': []
            }
        },

        enemies: []
    };

    /*=============================================================================*/
    /* Variables and Constants                                                     */
    /*=============================================================================*/

    var map,
        player,
        renderer,
        enemy = [],
        projectile = [],
        particle = [];

    var WIDTH = 640,
        HEIGHT = 400,
        TILE = 16,
        GRAVITY = 80,
        METER = 20,
        MAXDX = 8,
        MAXDY = 8,
        ACCEL = 1 / 6,
        FRICTION = 1 / 8,
        DEBUG = false,
        FALLING_JUMP = FPS,
        PLAYER = cfg.animation.player,
        INPUTS = cfg.state.inputs,
        KEY = { A: 65, Z: 90, X: 88, LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, R: 82, SHIFT: 16 };

    /*=============================================================================*/
    /* Game Setup                                                                  */
    /*=============================================================================*/

    function run() {
        Game.Load.images(cfg.images, function(images) {
            Game.Load.json(cfg.levels.test, function(level) {
                setup(images, level);
                Game.run({
                    update: update,
                    render: render
                });
                Dom.on(document, 'keydown', function(ev) {
                    return onkey(ev, ev.keyCode, true);
                }, false);
                Dom.on(document, 'keyup', function(ev) {
                    return onkey(ev, ev.keyCode, false, true);
                }, false);
            });
        });
    }

    function setup(images, level) {
        map = new Map(level);
        player = new Player();
        renderer = new Renderer(images);
        projectiles = new Projectiles();
        particles = new Particles();
    }

    function update(dt) {
        player.update(dt);
        projectiles.update(dt);
        particles.update(dt);
    }

    function render(dt) {

        renderer.render(dt);
    }

    function onkey(ev, key, pressed, up) {

        switch (key) {
            case KEY.UP:
                player.input.up = pressed;
                ev.preventDefault();
                if (!player.isdown.up) {
                    player.isdown.up = setTimeout(function() { player.isdown.up = false }, 300);
                    break;
                } else {
                    player.double.up = pressed;
                    break;
                }

            case KEY.DOWN:
                player.input.down = pressed;
                ev.preventDefault();
                if (!player.isdown.down) {
                    player.isdown.down = setTimeout(function() { player.isdown.down = false }, 300);
                    break;
                } else {
                    player.double.down = pressed;
                    break;
                }

            case KEY.LEFT:
                player.input.left = pressed;
                ev.preventDefault();
                if (!player.isdown.left) {
                    player.isdown.left = setTimeout(function() { player.isdown.left = false }, 300);
                    break;
                } else {
                    player.double.left = pressed;
                    break;
                }

            case KEY.RIGHT:
                player.input.right = pressed;
                ev.preventDefault();
                if (!player.isdown.right) {
                    player.isdown.right = setTimeout(function() { player.isdown.right = false }, 300);
                    break;
                } else {
                    player.double.right = pressed;
                    break;
                }

            case KEY.Z:
                player.input.jump = pressed && player.input.jumpAvailable;
                player.input.jumpAvailable = !pressed;
                break;

            case KEY.X:
                player.input.fire = pressed;
                break;

            case KEY.A:
                player.input.toggle = pressed;
                break;

            case KEY.SHIFT:
                player.input.diag = pressed;
                break;
        }
        return false;
    }

    /*=============================================================================*/
    /* Map                                                                         */
    /*=============================================================================*/

    var Map = Class.create({

        initialize: function(level) {
            this.name = level.name;
            this.color = level.color;
            this.cols = level.map.length;
            this.rows = level.map[0].length;
            this.grid = this.createGrid(level.map);
            this.ground = { platform: true };
            this.air = { platform: false };
        },

        getCell: function(col, row, set) {
            if (col < 0)
                return this.ground;
            else if (col >= this.cols)
                return this.air;
            else
                return this.grid[col][row];
        },

        createGrid: function(index) {
            var col, row, cell, grid = [];
            for (col = 0; col < this.cols; col++) {
                grid[col] = [];
                for (row = 0; row < this.rows; row++) {
                    cell = index[col][row];
                    grid[col][row] = {
                        platform: (cell == 'X'),
                    }
                }
            }
            console.log(grid);
            return grid;
        }

    });

    /*=============================================================================*/
    /* Player                                                                      */
    /*=============================================================================*/

    var Player = Class.create({

        initialize: function() {
            this.cells = [];
            this.x = 60;
            this.y = 200;
            this.w = 16;
            this.h = 32;
            this.dx = 0;
            this.dy = 0;
            this.maxdx = METER * MAXDX;
            this.maxdy = METER * MAXDY;
            this.accel = this.maxdx / ACCEL;
            this.friction = this.maxdx / FRICTION;
            this.gravity = GRAVITY * 10;
            this.impulse = -METER * (17 * FPS);

            this.stun = 10;
            this.run = 1;
            this.reloading = 0;
            this.hurting = 0;
            this.running = false;
            this.ledging = false;
            this.firing = false;
            this.aiming = false;
            this.jumping = false;
            this.jumpable = true;
            this.facing = 'r';
            this.dir = 'r';
            this.weapon = cfg.projectile.default;
            this.shot = false;
            this.collision = this.collisionPoints();
            this.animation = PLAYER.STANDING
            this.input = { up: false, down: false, left: false, right: false, jump: false, jumpAvailable: false, fire: false, diag: false, toggle: false };
            this.isdown = { up: false, down: false, left: false, right: false, jump: false, jumpAvailable: false, fire: false, diag: false, toggle: false };
            this.double = { up: false, down: false, left: false, right: false, jump: false, jumpAvailable: false, fire: false, diag: false, toggle: false };
            Game.animate(FPS, this, PLAYER.STANDING);
        },

        collisionPoints: function() {
            return {
                gripLeft: { x: this.x - 4, y: this.y - 4 },
                gripRight: { x: this.x + 19, y: this.y - 4 },
                topLeft: { x: this.x, y: this.y },
                topRight: { x: this.x + 15, y: this.y },
                upperLeft: { x: this.x - 1, y: this.y + 6 },
                upperRight: { x: this.x + 16, y: this.y + 6 },
                lowerLeft: { x: this.x - 1, y: this.y + 20 },
                lowerRight: { x: this.x + 16, y: this.y + 20 },
                bottomLeft: { x: this.x, y: this.y + 32 },
                bottomRight: { x: this.x + 15, y: this.y + 32 },
            }
        },

        update: function(dt) {
            this.animate();
            this.updateCollision();

            if (this.input.toggle) {
                if (!this.toggled) {
                    this.weapon = this.weapon == cfg.projectile.rainbowBlast ? cfg.projectile.default : cfg.projectile.rainbowBlast,
                        this.toggled = true;
                }
            } else
                this.toggled = false;

            this.dir = this.setdir();
            this.actionCountdown();

            var wasleft = this.dx < 0,
                wasright = this.dx > 0,
                falling = this.falling,
                fallingUp = this.falling && (this.dy < 0),
                fallingDown = this.falling && (this.dy >= 1),
                walljumping = this.walljumping,
                ledging = this.ledging,
                friction = this.friction * (this.falling ? 0.7 : 1),
                accel = this.accel * (this.falling ? 0.7 : 1);

            if (fallingDown)
                this.jumping = false;

            if (this.stun) {
                this.stun = countdown(this.stun);
            } else {

                this.ddx = 0;
                this.ddy = falling && !ledging ? this.gravity : 0;

                if (this.input.jump) {
                    this.input.jump.pressed = true;
                    if (!this.jumping && this.jumpable && !this.input.jump.pressed) {
                        if (walljumping == 'l' && this.input.right)
                            this.walljump();
                        else if (walljumping == 'r' && this.input.left)
                            this.walljump(true);
                        else if (!falling || ledging)
                            this.jump();
                    }
                } else
                    this.input.jump.pressed = false;


                if (!this.input.jump && fallingUp)
                    this.dy = this.dy / 1.7;

                if ((!this.input.fire) &&
                    ((this.input.left && ledging == 'r') ||
                        (this.input.right && ledging == 'l') ||
                        (this.input.down && ledging)))
                    this.ledging = false;

                if ((ledging && !this.input.fire) || !ledging) {

                    if ((this.input.left && !this.input.right)) {
                        this.walking = true;
                        this.facing = 'l';
                        this.run = this.double.left ? 1.6 : 1;
                        this.ddx = this.ddx - (accel * this.run);
                    } else if (wasleft) {
                        this.walking = false;
                        this.standing = true;
                        this.ddx = this.ddx + friction * 2;
                    }

                    if ((this.input.right && !this.input.left)) {
                        this.walking = true;
                        this.facing = 'r';
                        this.run = this.double.right ? 1.6 : 1;
                        this.ddx = this.ddx + (accel * this.run);
                    } else if (wasright) {
                        this.walking = false;
                        this.standing = true;
                        this.ddx = this.ddx - friction * 2;
                    }

                }

                if (this.input.down && fallingDown && this.double.down) {
                    this.dy = this.maxdy * 2;
                }

                if (this.input.fire) {
                    this.firing = true;
                    this.aiming = 20;
                    this.shooting = 2;
                    if (!this.stun && !this.reloading) {
                        if (!this.shot) {
                            this.fire();
                            if (this.weapon.automatic)
                                this.shot = true;
                        }
                    }
                } else {
                    this.firing = false;
                    this.shot = false;
                }

                this.updatePosition(dt);

                while (this.checkCollision()) {

                }

                this.collision = this.collisionPoints();

                if ((wasleft && (this.dx > 0)) ||
                    (wasright && (this.dx < 0))) {
                    this.dx = 0;
                }

                if (this.falling && (this.fallingJump > 0))
                    this.fallingJump = this.fallingJump - 1;
            }
        },

        updatePosition: function(dt) {
            this.x = this.x + (dt * this.dx);
            this.y = this.y + (dt * this.dy);
            this.dx = bound(this.dx + (dt * this.ddx), (-this.maxdx * this.run), (this.maxdx * this.run));
            this.dy = bound(this.dy + (dt * this.ddy), this.impulse, this.maxdy * 2);
        },

        actionCountdown: function() {
            this.hurting = countdown(this.hurting);
            this.reloading = countdown(this.reloading);
            this.click = countdown(this.click);
            this.aiming = countdown(this.aiming);
            this.shooting = countdown(this.shooting);
        },

        checkCollision: function() {
            var falling = this.falling,
                fallingUp = this.falling && (this.dy < 0),
                fallingDown = this.falling && (this.dy >= 1),
                runningLeft = this.dx < 0,
                runningRight = this.dx > 0,
                tl = this.collision.topLeft,
                tr = this.collision.topRight,
                ul = this.collision.upperLeft,
                ur = this.collision.upperRight,
                ll = this.collision.lowerLeft,
                lr = this.collision.lowerRight,
                bl = this.collision.bottomLeft,
                br = this.collision.bottomRight,
                gl = this.collision.gripLeft,
                gr = this.collision.gripRight;

            this.updateCollisionPoint(tl);
            this.updateCollisionPoint(tr);
            this.updateCollisionPoint(ul);
            this.updateCollisionPoint(ur);
            this.updateCollisionPoint(ll);
            this.updateCollisionPoint(lr);
            this.updateCollisionPoint(bl);
            this.updateCollisionPoint(br);
            this.updateCollisionPoint(gl);
            this.updateCollisionPoint(gr);

            if (tl.pickup) return this.collect(tl);
            else if (tr.pickup) return this.collect(tr);
            else if (ul.pickup) return this.collect(ul);
            else if (ur.pickup) return this.collect(ur);
            else if (ll.pickup) return this.collect(ll);
            else if (lr.pickup) return this.collect(lr);
            else if (bl.pickup) return this.collect(bl);
            else if (br.pickup) return this.collect(br);

            if (fallingDown && gl.blocked && ul.blocked && ll.blocked && !bl.blocked) {
                this.jumping = false;
                this.jumpable = true;
                this.walljumping = 'l';
            } else if (fallingDown && gr.blocked && ur.blocked && lr.blocked && !br.blocked) {
                this.jumping = false;
                this.walljumping = 'r';
                this.jumpable = true;
            } else
                this.walljumping = false;

            if (fallingDown && runningLeft && ul.blocked && !bl.blocked && !gl.blocked && !this.ledging) {
                this.jumping = false;
                this.jumpable = true;
                return this.ledgeGrab(gl);
            }

            if (fallingDown && runningRight && ur.blocked && !br.blocked && !gr.blocked && !this.ledging) {
                this.jumping = false;
                this.jumpable = true;
                return this.ledgeGrab(gr, true);
            }

            if (fallingDown && bl.blocked && !ul.blocked && !ll.blocked && bl.y - 6 < (bl.col * TILE))
                return this.collideDown(bl);

            if (fallingDown && br.blocked && !ur.blocked && !lr.blocked && br.y - 6 < (br.col * TILE))
                return this.collideDown(br);

            if (fallingUp && tl.blocked && !ul.blocked && !ll.blocked && !bl.blocked)
                return this.collideUp(tl);

            if (fallingUp && tr.blocked && !ur.blocked && !lr.blocked && !br.blocked)
                return this.collideUp(tr);

            if (runningRight && ur.blocked && !ul.blocked)
                return this.collide(ur, true);
            else if (runningRight && lr.blocked && !ll.blocked)
                return this.collide(lr, true);
            else if (fallingDown && runningRight && br.blocked)
                return this.collide(br, true);

            if (runningLeft && ul.blocked && !ur.blocked)
                return this.collide(ul);
            else if (runningLeft && ll.blocked && !lr.blocked)
                return this.collide(ll);
            else if (fallingDown && runningLeft && bl.blocked)
                return this.collide(bl);


            if (!falling && !bl.blocked && !br.blocked)
                return this.startFall(true);
        },

        updateCollisionPoint: function(point) {
            point.col = Math.floor(point.y / TILE);
            point.row = Math.floor(point.x / TILE);
            point.cell = map.getCell(point.col, point.row);
            point.blocked = point.cell.platform;
            point.enemy = false;
            point.pickup = false;
        },

        updateCollision() {
            this.row = Math.floor(this.x / TILE);
            this.col = Math.floor(this.y / TILE);
        },

        fire: function() {
            var x, y, type = this.weapon;

            switch (this.dir) {
                case 'l':
                    tx = this.x - 20;
                    ty = this.y;
                    break;
                case 'ul':
                    tx = this.x - 20;
                    ty = this.y - 20;
                    break;
                case 'dl':
                    tx = this.x - 20;
                    ty = this.y + 20;
                    break;
                case 'r':
                    tx = this.x + 20;
                    ty = this.y;
                    break;
                case 'ur':
                    tx = this.x + 20;
                    ty = this.y - 20;
                    break;
                case 'dr':
                    tx = this.x + 20;
                    ty = this.y + 20;
                    break;
                case 'u':
                    tx = this.x;
                    ty = this.y - 20;
                    break;
                case 'd':
                    tx = this.x;
                    ty = this.y + 20;
                    break;
            }

            projectiles.create(this.x, this.y, tx, ty, type);

            this.reloading = this.weapon.reload || 20;
        },

        setdir: function() {
            var up = this.input.up,
                down = this.input.down,
                left = this.input.left,
                right = this.input.right,
                diag = this.input.diag;

            if (diag)
                return this.ledging == 'l' ? (down ? 'dr' : up ? 'ur' : this.dir == 'dr' ? 'dr' : this.dir == 'ur' ? 'ur' : 'ur') :
                    this.ledging == 'r' ? (down ? 'dl' : up ? 'ul' : this.dir == 'dl' ? 'dl' : this.dir == 'dr' ? 'dl' : 'ul') :
                    this.facing == 'l' ? (down ? 'dl' : up ? 'ul' : this.dir == 'dl' ? 'dl' : this.dir == 'dr' ? 'dl' : 'ul') :
                    (down ? 'dr' : up ? 'ur' : this.dir == 'dr' ? 'dr' : this.dir == 'dl' ? 'dr' : 'ur');
            else if (left)
                return up ? 'ul' : down ? 'dl' : 'l';
            else if (right)
                return up ? 'ur' : down ? 'dr' : 'r';
            else if (up)
                return 'u';
            else if (down)
                return 'd';
            else if (this.facing == 'l')
                return this.ledging ? 'r' : 'l';
            else
                return this.ledging ? 'l' : 'r';
        },

        collect: function(point) {},

        startFall: function(allowFall) {
            this.falling = true;
            this.fallingJump = allowFall ? FALLING_JUMP : 0;
        },

        collide: function(point, right) {
            this.x = (point.row * TILE) + (right ? -TILE : TILE);
            this.dx = 0;
            this.jumpable = true;
            return true;
        },

        collideUp: function(point) {
            this.y = (point.col * TILE) + TILE;
            this.dy = 0;
            return true;
        },

        collideDown: function(point) {
            this.jumping = false;
            this.falling = false;
            this.standing = true;
            this.y = (point.col * TILE) - (TILE * 2);
            this.dy = 0;
            this.stun = 2;
            return true;
        },

        jump: function() {
            this.jumping = true;
            if (this.ledging) {
                this.ddy = this.impulse / 1.5;
                this.ledging = false;
            } else
                this.ddy = this.impulse;
            this.dy = 0;
            this.startFall(false);
        },

        walljump: function(right) {
            this.ddy = this.impulse / 1.3;
            this.dy = 0;
            this.startFall(false);
            if (right) {
                this.x = this.x + 6;
                var point = this.collision.upperRight;
                this.updateCollisionPoint(point);
            } else {
                this.x = this.x - 6;
                var point = this.collision.upperLeft;
                this.updateCollisionPoint(point);
            }
            this.jumping = true;
            this.stun = 4;
        },

        ledgeGrab: function(point, right) {
            this.y = (point.col * TILE) + TILE;
            this.dy = 0;
            right ? this.ledging = 'r' : this.ledging = 'l';
            this.stun = 1;
            this.jumpable = true;
            return true;
        },

        animate: function(frame) {

            var animState = '';

            if (this.walljumping)
                animState = 'Wall jumping';
            else if (this.ledging)
                animState = 'Ledging';
            else if (this.jumping)
                animState = 'Jumping';
            else if (this.falling)
                animState = 'Falling';
            else if (this.running)
                animState = 'Running';
            else if (this.walking)
                animState = 'Walking';
            else
                animState = 'Standing';

            if (this.shooting) {
                switch (this.dir) {
                    case 'l':
                        animState = animState + ', shooting left';
                        break;
                    case 'ul':
                        animState = animState + ', shooting up left';
                        break;
                    case 'dl':
                        animState = animState + ', shooting down left';
                        break;
                    case 'r':
                        animState = animState + ', shooting right';
                        break;
                    case 'ur':
                        animState = animState + ', shooting up right';
                        break;
                    case 'dr':
                        animState = animState + ', shooting down right';
                        break;
                    case 'u':
                        animState = animState + ', shooting up';
                        break;
                    case 'd':
                        animState = animState + ', shooting down';
                        break;
                }
            }
            console.log(animState);
        }

    });

    /*=============================================================================*/
    /* Projectile Controller                                                       */
    /*=============================================================================*/

    var Projectiles = Class.create({

        initialize: function() {},

        update: function(dt) {
            var i = projectile.length;
            while (i--) { projectile[i].update(i); };
        },

        create: function(startX, startY, targetX, targetY, type) {
            projectile.push(new Projectile(startX, startY, targetX, targetY, type));
        },

        destroy: function(index) {
            projectile.splice(index, 1);
        }

    });

    /*=============================================================================*/
    /* Projectile                                                                  */
    /*=============================================================================*/

    var Projectile = Class.create({

        initialize: function(startX, startY, targetX, targetY, type) {

            this.cells = [];
            this.cols = [];
            this.rows = [];

            this.x = startX;
            this.y = startY + 10;
            this.w = TILE;
            this.h = TILE;
            this.startX = this.x;
            this.startY = this.y;
            this.hit = false;
            this.vx = 0;
            this.vy = 0;
            this.dx = 0;
            this.dy = 0;
            this.gravity = 1;
            this.targetX = targetX;
            this.targetY = targetY;

            this.coordLast = [
                { x: this.x, y: this.y },
                { x: this.x, y: this.y },
                { x: this.x, y: this.y }
            ];

            this.hue = type.hue.length == 3 ? rand(type.hue[0], type.hue[1]) * type.hue[2] :
                type.hue.length == 2 ? rand(type.hue[0], type.hue[1]) :
                type.hue.length == 1 ? type.hue : 50;

            this.speed = type.speed || 4;
            this.accel = type.accel || 0;
            this.hueVar = type.hueVar || 0;
            this.alpha = type.alpha || 50;
            this.brightness = type.brightness || 50;
            this.lineWidth = type.lineWidth || 5;
            this.maxradius = type.radius || 4;
            this.partCount = type.partCount || 2;

            this.angle = Math.atan2((targetY + rand(-10, 10) / 100) - startY, (targetX + rand(-10, 10) / 100) - startX);
            this.radius = 0;

            this.particle = [];
            this.particle.speed = type.partSpeed || 1 / 10;
            this.particle.speedVar = type.partSpeedVar || 1;
            this.particle.wind = type.partWind || 1;
            this.particle.friction = type.partFriction || 1;
            this.particle.gravity = type.partGravity || 1;
            this.particle.alpha = type.partAlpha || 50;
            this.particle.lineWidth = type.partLineWidth || 2;
            this.particle.flicker = type.flicker || 1;
            this.particle.brightness = type.brightness || 50;

        },

        update: function(index) {

            if (this.hueVar && !this.hit)
                this.hue += rand(this.hueVar[0], this.hueVar[1]) * (rand(this.hueVar[0], this.hueVar[1]) * this.hueVar[0], this.hueVar[2]);

            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed * this.gravity;
            this.dx = this.vx;
            this.dy = this.vy;

            this.speed *= 1 + this.accel;
            this.coordLast[2].x = this.coordLast[1].x;
            this.coordLast[2].y = this.coordLast[1].y;
            this.coordLast[1].x = this.coordLast[0].x;
            this.coordLast[1].y = this.coordLast[0].y;
            this.coordLast[0].x = this.x;
            this.coordLast[0].y = this.y;

            if (this.intersects(this.cell)) {
                this.hit = true;
                this.speed = 0;
                this.accel = 0;
                particles.create(this.x, this.y, this.hue, this.particle, this.partCount);
            }

            this.x = this.x + this.dx;
            this.y = this.y + this.dy;

            this.lineDistance(this.coordLast[0], this.coordLast[2]);

            if (this.hit) {
                if (this.radius < this.maxradius) {
                    this.radius += 1;
                } else {
                    projectiles.destroy(index);
                }
            }
        },

        draw: function(ctx) {
            renderer.renderProjectile(ctx, this);
            if (DEBUG) renderer.renderGrid(this.col, this.row, this.col2, this.row2);
        },

        intersects: function(other) {

            this.col = [];
            this.row = [];
            this.col2 = [];
            this.row2 = [];

            this.col = Math.floor(this.y / TILE);
            this.row = Math.floor(this.x / TILE);
            this.cell = map.getCell(this.col, this.row);
            this.blocked = (this.cell == undefined) ? 'ofr' : this.cell.platform;

            if ((this.blocked == 'ofr') ||
                (this.blocked && overlap(this.dx, this.dy, this.w, this.h,
                    this.cell.x, this.cell.y, this.cell.x + TILE, this.cell.y + TILE))) {
                return true;
            } else {
                return false;
            }
        },

        lineDistance: function(p1, p2) {

            var lx, ly, tx, ty, c, r;

            lx = Math.round(Math.abs(p2.x - p1.x));
            ly = Math.round(Math.abs(p2.y - p1.y));

            tx = Math.floor(lx / TILE) + 1;
            ty = Math.floor(ly / TILE) + 1;

            for (var i = 0; i < tx; i++) {
                for (var j = 0; j < ty; j++) {
                    this.col = Math.floor(p1.x / TILE);
                    this.row = Math.floor((p1.y / TILE) + 1);
                    this.col2 = Math.floor(p2.x / TILE);
                    this.row2 = Math.floor((p2.y / TILE) + 1);
                }
            }
        }

    });

    /*=============================================================================*/
    /* Particles Controller                                                        */
    /*=============================================================================*/

    var Particles = Class.create({

        initialize: function() {},

        update: function(dt) {
            var i = particle.length;
            while (i--) { particle[i].update(i); };
        },

        create: function(startX, startY, hue, type, num) {
            for (var i = 0; i < num; i++)
                particle.push(new Particle(startX, startY, hue, type));
        },

        destroy: function(index) {
            particle.splice(index, 1);
        }

    });

    /*=============================================================================*/
    /* Particles                                                                   */
    /*=============================================================================*/

    var Particle = Class.create({

        initialize: function(x, y, hue, type) {
            this.Speed = type.speed || 1;
            this.speedVar = type.speedVar || 1;
            this.Wind = type.wind || 1;
            this.Friction = type.friction || 1;
            this.Gravity = type.gravity || 1;
            this.clearAlpha = type.clearAlpha || 25;
            this.flicker = type.flicker || 20;
            this.angle = type.angle || rand(0, 360);
            this.hue = hue || 1;
            this.hueVariance = 0 || 0;
            this.brightness = type.brightness || 0;
            this.lineWidth = type.lineWidth || 1;

            this.x = x;
            this.y = y;
            this.coordLast = [
                { x: x, y: y },
                { x: x, y: y },
                { x: x, y: y }
            ];

            this.speed = rand(((this.Speed - this.speedVar) <= 0) ? 1 : this.Speed - this.speedVar, (this.Speed + this.speedVar));
            this.friction = 1 - this.Friction / 100;
            this.gravity = this.Gravity / 2;
            this.alpha = rand(40, 100) / 100;
            this.decay = rand(10, 50) / 400;
            this.wind = (rand(0, this.Wind) - (this.Wind / 2)) / 25;
        },

        update: function(index) {
            var radians = this.angle * Math.PI / 180;
            var vx = Math.cos(radians) * this.speed;
            var vy = Math.sin(radians) * this.speed + this.gravity;
            this.speed *= this.friction;

            this.coordLast[2].x = this.coordLast[1].x;
            this.coordLast[2].y = this.coordLast[1].y;
            this.coordLast[1].x = this.coordLast[0].x;
            this.coordLast[1].y = this.coordLast[0].y;
            this.coordLast[0].x = this.x;
            this.coordLast[0].y = this.y;

            this.x += vx;
            this.y += vy;

            this.angle += this.wind;
            this.alpha -= this.decay;

            if (this.alpha <= 0) {
                particles.destroy(index);
            }
        },

        draw: function(ctx) {
            renderer.renderParticle(ctx, this);
        },

    });

    /*=============================================================================*/
    /* Renderer
    /*=============================================================================*/

    var Renderer = Class.create({

        initialize: function(images) {
            this.images = images;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.debug = Dom.get('debug');
            this.ground = this.createGround();
            this.back = this.createBack();
            console.log(this.back);
        },

        render: function(dt) {

            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

            this.renderGround(this.ctx);
            this.renderPlayer(this.ctx);

            var i = projectile.length;
            while (i--) { projectile[i].draw(this.ctx); };

            var j = particle.length;
            while (j--) { particle[j].draw(this.ctx); };
        },

        renderEffect: function(ctx) {},

        renderMap: function(ctx) {

            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, this.ground.w, this.ground.h);
        },

        renderPlayer: function(ctx) {

            ctx.drawImage(this.images.player,
                player.animation.x + (player.animationFrame * player.animation.w),
                player.animation.y,
                player.animation.w,
                player.animation.h,
                player.x,
                player.y,
                player.w,
                player.h
            );


            if (DEBUG) {
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(player.collision.gripLeft.x, player.collision.gripLeft.y, 2, 2);
                ctx.fillRect(player.collision.gripRight.x, player.collision.gripRight.y, -2, 2);
                ctx.fillRect(player.collision.topLeft.x, player.collision.topLeft.y, 2, 2);
                ctx.fillRect(player.collision.topRight.x, player.collision.topRight.y, -2, 2);
                ctx.fillRect(player.collision.upperLeft.x, player.collision.upperLeft.y, 2, 2);
                ctx.fillRect(player.collision.upperRight.x, player.collision.upperRight.y, -2, 2);
                ctx.fillRect(player.collision.lowerLeft.x, player.collision.lowerLeft.y, 2, 2);
                ctx.fillRect(player.collision.lowerRight.x, player.collision.lowerRight.y, -2, 2);
                ctx.fillRect(player.collision.bottomLeft.x, player.collision.bottomLeft.y, 2, -2);
                ctx.fillRect(player.collision.bottomRight.x, player.collision.bottomRight.y, -2, -2);
            }
        },

        renderGround: function(ctx) {
            var ground = this.ground,
                x = ground.w,
                y = ground.h,
                w = Math.min(WIDTH),
                w2 = WIDTH - w;
            ctx.fillStyle = '#f5f5f5';

            var offsetX = bound(-player.x + WIDTH / 2, -WIDTH * 2, x - WIDTH);
            var offsetY = bound(-player.y + HEIGHT / 2, -HEIGHT, y - HEIGHT);

            ctx.translate(offsetX, offsetY);
            ctx.drawImage(this.back.image, 0, 0);
            ctx.drawImage(this.ground.image, 0, 0);
        },

        renderProjectile: function(ctx, index) {

            ctx.strokeStyle = 'hsla(' + index.hue + ', 100%, ' + index.brightness + '%, ' + index.alpha + ')';

            if (!index.hit) {
                ctx.lineCap = 'round';
                ctx.lineWidth = index.lineWidth;

                var coordRand = (rand(1, 3) - 1);
                ctx.beginPath();
                ctx.moveTo(Math.round(index.coordLast[coordRand].x), Math.round(index.coordLast[coordRand].y));
                if (index.hit)
                    ctx.lineTo(Math.round(index.x), Math.round(index.y));
                else
                    ctx.lineTo(Math.round(index.x), Math.round(index.y));
                ctx.closePath();
                ctx.stroke();
                
            } else {
                ctx.save();
                ctx.beginPath();
                ctx.arc(Math.round(index.x), Math.round(index.y), index.radius, 0, Math.PI * 2, false)
                ctx.closePath();
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
            }
        },

        renderParticle: function(ctx, index) {
            ctx.lineWidth = index.lineWidth;
            var coordRand = (rand(1, 3) - 1);
            ctx.beginPath();
            ctx.moveTo(Math.round(index.coordLast[coordRand].x), Math.round(index.coordLast[coordRand].y));
            ctx.lineTo(Math.round(index.x), Math.round(index.y));
            ctx.closePath();
            ctx.strokeStyle = 'hsla(' + index.hue + ', 100%, ' + index.brightness + '%, ' + index.alpha + ')';
            ctx.stroke();

            if (index.flicker > 0) {
                var inverseDensity = 50 - index.flicker;
                if (rand(0, inverseDensity) === inverseDensity) {
                    ctx.beginPath();
                    ctx.arc(Math.round(index.x), Math.round(index.y), rand(index.lineWidth, index.lineWidth + 3) / 2, 0, Math.PI * 2, false)
                    ctx.closePath();
                    var randAlpha = rand(50, 100) / 100;
                    ctx.fillStyle = 'hsla(' + index.hue + ', 100%, ' + index.brightness + '%, ' + randAlpha + ')';
                    ctx.fill();
                }
            }
        },

        createGround: function() {
            var w = map.rows * TILE,
                h = map.cols * TILE,
                tile = this.images.ground,
                tw = tile.width,
                th = tile.height,
                max = Math.floor(w / tile.width),
                dw = w / max,
                image = Game.Canvas.render(w, h, function(ctx) {
                    var r, c;
                    for (c = 0; c < map.rows; c++) {
                        for (r = 0; r < map.cols; r++) {
                            if (map.grid[r][c].platform == true) {
                                ctx.drawImage(tile, c * TILE, r * TILE);
                            }
                        }
                    }
                });

            return { w: w, h: h, image: image };
        },

        createBack: function() {

            var w = this.ground.w,
                h = this.ground.h,

                image = Game.Canvas.render(w, h, function(ctx) {

                    for (var x = 0.5; x < w; x += 16) {
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, h);
                    }

                    for (var y = 0.5; y < h; y += 16) {
                        ctx.moveTo(0, y);
                        ctx.lineTo(w, y);
                    }

                    ctx.strokeStyle = '#eee';
                    ctx.stroke();


                    ctx.beginPath();
                    ctx.moveTo(0, 40);
                    ctx.lineTo(240, 40);
                    ctx.moveTo(260, 40);
                    ctx.lineTo(500, 40);
                    ctx.moveTo(495, 35);
                    ctx.lineTo(500, 40);
                    ctx.lineTo(495, 45);

                    ctx.moveTo(60, 0);
                    ctx.lineTo(60, 153);
                    ctx.moveTo(60, 173);
                    ctx.lineTo(60, 375);
                    ctx.moveTo(65, 370);
                    ctx.lineTo(60, 375);
                    ctx.lineTo(55, 370);

                    ctx.strokeStyle = "#000";
                    ctx.stroke();

                    ctx.font = "bold 12px sans-serif";
                    ctx.fillText("x", 248, 43);
                    ctx.fillText("y", 58, 165);

                    ctx.font = "bold 12px sans-serif";
                    ctx.fillText("x", 248, 43);
                    ctx.fillText("y", 58, 165);

                });

            console.log('map width: ' + w + ', ' + 'map height: ' + h);
            return { w: w, h: h, image: image };
        },

        renderGrid: function(col, row, col2, row2) {
            ctx = renderer.ctx;
            ctx.lineWidth = 1;
            ctx.rect((col * TILE), (row * TILE) - TILE, TILE, TILE);
            ctx.rect((col2 * TILE), (row2 * TILE) - TILE, TILE, TILE);
            ctx.strokeStyle = "#FF0000";
            ctx.stroke();

            ctx.save();
            ctx.restore();
        }

    });

    run();

})();
