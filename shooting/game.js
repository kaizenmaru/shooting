enchant();

// グローバル変数
var PLAYER_SIZE = 32;
var bullets = null;    			// プレイヤーの弾を入れておく配列
var enemies = null;    			// 敵を入れておく配列
var enemyCount = null; 			// 敵の数
var isBoss = null;     			// ボスを生成するかのフラグ
var aliveBoss = null;  			// ボスが生存しているかのフラグ
var aliveBoss2 = null; 			// ボス２が生存しているかのフラグ
var isEnemy = null;    			// 敵を生成するかのフラグ
var boss = null;
var boss2 = null;
var bossAppearTime = null;  	// ボスを生成するまでの間をあける時間
var clearCount = 0;      		// ボスを倒した回数
var bossDisappearCount = null;  // clearCount==2の時に使う,ボスを何体倒したか
var changeSceneTime = null;
var bossIsDead = null;
var playerLife = 3;
var playerIsAlive = null;
var playerAppearTime = null;
var playBgm1 = null;

window.onload = function() {
	
	core = new Core(320, 320);
	core.fps = 30;
	core.score = 0;
	core.time = 60;
	
	core.preload('chara3.png', 'effect0.png', 'map0.png',
				 'icon0.png', 'golem.png', 'akuma.png',
				 'map2.png', 'shachihoko_r.png', 'shachihoko_l.png');
	
	core.onload = function() {
		
		//タイトルシーン
		var titleScene = function(){
			var scene = new Scene();
			var bg = new Sprite(320, 320);
			var surface = new Surface(320, 320);
			for(var i = 0; i < 20; i++){
				for(var j = 0; j < 20; j++){
					surface.draw(core.assets['map0.png'], 96, 0, 16, 16, 16 * i, 16 * j, 16, 16);
				}
			}
			bg.image = surface;
			scene.addChild(bg);
			
			var titleLabel = new MultiLabel('center', core.height / 2 - 30,
				 "戦車シューティング", "white", scene);
			titleLabel.font = "24px sans-serif";
			var startLabel = new MultiLabel('center', core.height / 2 + 50,
				 "はじめる", "white", scene);
			startLabel.font = "20px sans-serif";
			startLabel.on('touchend', function (){
				core.replaceScene(mainScene());
			});
			return scene;
		};
		
		// メインシーン
		var mainScene = function(){
			var scene = new Scene();
			var tick = 0;
			var count = 0; // プレイヤーが撃った弾の回数
			var bg = new Sprite(320, 640);
			var surface = new Surface(320, 640);
			if(clearCount % 3 == 0){
				for(var i = 0; i < 20; i++){
					for(var j = 0; j < 40; j++){
						surface.draw(core.assets['map0.png'], 96, 0, 16, 16, 16 * i, 16 * j, 16, 16);
					}
				}
			}
			else if(clearCount % 3 == 1){
				for(var i = 0; i < 20; i++){
					for(var j = 0; j < 40; j++){
						surface.draw(core.assets['map2.png'], 16, 0, 16, 16, 16 * i, 16 * j, 16, 16);
					}
				}
			}
			else{
				scene.backgroundColor = "black";
				for(var i = 0; i < 20; i++){
					for(var j = 0; j < 40; j++){
						surface.draw(core.assets['map2.png'], 16, 16, 16, 16, 16 * i, 16 * j, 16, 16);
					}
				}
			}
			bg.image = surface;
			bg.x = 0;
			bg.y = -320;
			scene.addChild(bg);
			
			var scoreLabel = new ScoreLabel(5, 5);
			scene.addChild(scoreLabel);
			var lifelabel = new LifeLabel(core.width/2 + 30, 5, 3);
			scene.addChild(lifelabel);
			
			var player = new Player(scene);
			
			//ゲーム開始時の処理
			scene.onenter = function(){
				playerAppearTime = 0;
				scoreLabel.score = core.score;
				lifelabel.life = playerLife;
				playerIsAlive = true;
				bullets = [];
				enemies = [];
				enemyCount = 0;
				isBoss = false;
				isEnemy = true;
				aliveBoss = false;
				aliveBoss2 = false;
				bossAppearTime = 0;
				changeSceneTime = 0;
				bossIsDead = false;
				if(clearCount == 2){
					bossDisappearCount = 0;
				}
			};
			
			//タッチムーブでプレイヤーの移動
			scene.ontouchmove = function(e){
				player.x = e.x - PLAYER_SIZE/2;
				if(player.x >= core.width - player.width) player.x = core.width - player.width;
				if(player.x <= 0) player.x = 0;
				player.y = e.y - PLAYER_SIZE/2;
				if(player.y >= core.height - player.height) player.y = core.height - player.height;
				if(player.y <= 0) player.y = 0;
			};
			
			// 更新
			scene.onenterframe = function (){
				tick ++;
				
				scoreLabel.score = core.score;
				lifelabel.life = playerLife;
				if(playerIsAlive == true){
					// プレイヤーの弾の発射
					if(tick % 10 == 0){
						player.isAtk = true;
						var bullet = new Bullet(player.x + PLAYER_SIZE/2 - 8, player.y - 8, scene);
						count ++;
						bullet.key = count;
						bullets[bullet.key] = bullet;
					}
					
					// 敵の生成
					if(tick % (30 - (clearCount * 5)) == 0 && isEnemy == true){
						var enemy = new Enemy(player,scene);
						enemy.key = tick;
						enemies[enemy.key] = enemy;
						enemyCount ++;
						if(enemyCount > 20 + clearCount * 10){
							isBoss = true;
							isEnemy = false;
						}
					}
					
					// ボスの生成
					if(isBoss == true){
						bossAppearTime ++;
						if(bossAppearTime > 120){
							boss = new Boss(monstorTable[clearCount], player, scene);
							if(clearCount == 2){
								boss.x = 0;
							}
							if(clearCount == 2){
								boss2 = new Boss(monstorTable[clearCount+1], player, scene);
								boss2.x = core.width - boss2.width;
							}
							isBoss = false;
							aliveBoss = true;
							aliveBoss2 = true;
							bossAppearTime = 0;
						}
					}
					
					// ボスとプレイヤーの当たり判定
					if(aliveBoss == true){
						if(boss.within(player, 45)){
							playerIsAlive = false;
							playerLife --;
						}
						if(clearCount == 2){
							if(boss2.within(player, 45)){
								playerIsAlive = false;
								playerLife --;
							}
						}
					}
					
					//　プレイヤーが発射した弾と敵の当たり判定
					for(i in enemies){
						for(j in bullets){
							if(enemies[i].within(bullets[j], 16)){
								core.score += 100;
								var effect = new Effect(bullets[j].x - 5, bullets[j].y, scene);
								enemies[i].remove(scene);
								bullets[j].remove(scene);
								break;
							}
						}
					}
					
					//　プレイヤーが発射した弾とボスの当たり判定
					if(aliveBoss == true){
						for(i in bullets){
							if(bullets[i].within(boss, 32)){
								boss.count ++;
								core.score += 100;
								var effect = new Effect(bullets[i].x - 5, bullets[i].y, scene);
								bullets[i].remove(scene);
								if(boss.count >= boss.MAX_HP){
									
									core.score += 3000;
									if(clearCount != 2){
										aliveBoss = false;
										bossIsDead = true;
										boss.remove(scene);
										delete boss;
									}
									else{
										aliveBoss = false;
										bossDisappearCount ++;
										boss.remove(scene);
										delete boss;
									}
								}
								break;
							}
						}
					}
					
					//　プレイヤーが発射した弾とボス２の当たり判定
					if(aliveBoss2 == true){
						if(clearCount == 2){
							for(i in bullets){
								if(bullets[i].within(boss2, 32)){
									boss2.count ++;
									core.score += 100;
									var effect = new Effect(bullets[i].x - 5, bullets[i].y, scene);
									bullets[i].remove(scene);
									if(boss2.count >= boss2.MAX_HP){
										bossDisappearCount ++;
										core.score += 3000;
										aliveBoss2 = false;
										boss2.remove(scene);
										delete boss2;
									}
									break;
								}
							}
						}
					}
					
					// ボスが倒されたあと３秒たったらシーンを切り替える
					if(bossIsDead == true){
						changeSceneTime ++;
						if(changeSceneTime > 90){
							changeSceneTime = 0;
							bossIsDead = false;
							clearCount ++;
							core.replaceScene(mainScene());
						}
					}
					
					// clearCount==2の時のボスの処理
					if(clearCount == 2){
						if(bossDisappearCount >= 2){
							clearCount ++;
							scoreLabel.score = core.score;
							core.pushScene(gameoverScene("!! GAME CLEAR !!"));
						}
					}
					
					// 敵とプレイヤーの当たり判定
					for(i in enemies){
						if(enemies[i].within(player, 18)){
							playerIsAlive = false;
							var effect = new Effect(enemies[i].x - 5, enemies[i].y, scene);
							enemies[i].remove(scene);
							playerLife --;
							if(playerLife <= 0) core.pushScene(gameoverScene("GAME OVER"));
						}
					}
				}
				
				// プレイヤーが被弾したとき３秒間無敵
				if(playerIsAlive == false){
					playerAppearTime ++;
					if(playerAppearTime > 90){
						playerAppearTime = 0;
						playerIsAlive = true;
					}
				}
				
				// 残機が０の時ゲームオーバーにする
				if(playerLife <= 0){
					lifelabel.life = playerLife;
					core.pushScene(gameoverScene("GAME OVER"));
				} 
				
				// 背景スクロール
				bg.y += 4;
				if(bg.y >= 0) bg.y = -320;
			};
			return scene;
		};
		
		// ゲームオーバーシーン
		var gameoverScene = function (message){
			var scene = new Scene();
			var bg = new Sprite(320, 320);
			bg.backgroundColor = "black";
			bg.opacity = 0.5;
			scene.addChild(bg);
			
			var gameoverLabel = new MultiLabel('center', core.height / 2 - 50,
				 message, "white", scene);
			gameoverLabel.font = "30px sans-serif";
			var scoreLabel = new MultiLabel('center', core.height / 2,
				 "SCORE : " + core.score, "white", scene);
			scoreLabel.font = "24px sans-serif";
			var restart = new MultiLabel('center', core.height / 2 + 50,
				 "もう一回プレイ", "white", scene);
			restart.font = "24px sans-serif";
			restart.on('touchstart', function (){
				playerLife = 3;
				clearCount = 0;
				core.score = 0;
				core.popScene();
				core.replaceScene(titleScene());
			});
			return scene;
		};
		core.replaceScene(titleScene());
	};
	core.start();
};

// プレイヤークラス
var Player = Class.create(Sprite, {
	initialize: function(scene) {
		Sprite.call(this, 32, 32);
		this.image = core.assets['chara3.png'];
		this.frame = 18;
		this.x = core.width/2 - PLAYER_SIZE/2;
		this.y = core.height - PLAYER_SIZE - 10;
		this.atkFrame = [18,19,19,19,19,19,20];
		this.isAtk = false;
		this.count = 0;
		this.tick = 0;
		scene.addChild(this);
		this.onenterframe = function(){
			this.tick ++;
			//攻撃フラグがオンなら弾発射
			if(this.isAtk == true){
				if(this.count < this.atkFrame.length){
					this.frame = this.atkFrame[this.count];
					this.count ++;
				}
				else{
					this.isAtk = false;
					this.count = 0;
				}
			}
			if(playerIsAlive == false){
				if(this.tick % 5 == 0){
					if(this.visible == true){
						this.visible = false;
					}
					else{
						this.visible = true;
					}
				}
			}
			else{
				this.visible = true;
			}
		};
	}
});

// 敵クラス
var Enemy = Class.create(enchant.Sprite, {
	initialize: function(player, scene) {
		Sprite.call(this, 32, 32);
		this.image = core.assets['chara3.png'];
		this.mode = rnd(6);
		
		this.tick = 0;
		this.vx = rnd(2);
		
		if(this.mode == 1) this.x = core.width;
		else if(this.mode == 2) this.x = -(this.width);
		else this.x = rndSpan(50, 230, 0);
		
		if(this.mode == 1 || this.mode == 2) this.vy = 1;
		else this.vy = rndSpan(2, 3+clearCount, 4);
		
		if(this.mode == 1 || this.mode == 2) this.y = rndSpan(120, 160, 0);
		else this.y = -(this.height+30);
		
		if(this.mode == 1){
			this.frame = 9;
			this.rotate(45);
			this.tl.rotateBy(360, 50);
			this.tl.loop();
		} 
		else if(this.mode == 2){
			this.frame = 15;
			this.rotate(315);
			this.tl.rotateBy(360, 50);
			this.tl.loop();
		} 
		else this.frame = 3;
		
		this.player = player;
		scene.addChild(this);
		
		this.onenterframe = function() {
			this.tick ++;
			
			if(this.mode == 1){
				this.x -= this.vx;
				this.y -= this.vy;
			}
			else if(this.mode == 2){
				this.x += this.vx;
				this.y -= this.vy;
			}
			else{
				this.y += this.vy;
			}
			
			if(this.y > core.height + this.height){
				this.remove(scene);
			}
			
			// 弾を発射
			if(this.tick % (50 - (clearCount * 10)) == 0){
				if(this.mode == 1 || this.mode == 2){ // 0にすれば通らない
					var sx = (player.x + player.width / 2) - (this.x + this.width/2 - 8);
		          	var sy = (player.y + player.height / 2) - (this.y + this.height/2 + 9);
		          	var angle = Math.atan(sx / sy);
		          	//var a = angle * 180 / Math.PI;
		          	//console.log(a);
		          	//this.rotate(a);
					var bullet = new BossBullet(this.x + this.width/2 - 8, this.y + this.height/2 + 9, angle, this.player, scene);
				}
				else{
					var bullet = new EnemyBullet(this.x + this.width/2 - 8, this.y + this.height/2 + 9, this.player, scene);
					bullet.key = core.frame;
				}
			}
		};
	},
	remove: function(scene){
		scene.removeChild(this);
		delete enemies[this.key];
		delete this;
	}
});

var monstorTable = {
    0: {image: 'golem.png', hp:30, number:0},
    1: {image: 'akuma.png', hp:40, number:1},
    2: {image: 'shachihoko_r.png', hp:25, number:2},
    3: {image: 'shachihoko_l.png', hp:25, number:3},
};

// ボスクラス
var Boss = Class.create(Sprite, {
	initialize: function(m, player, scene){
		Sprite.call(this, 100, 100);
		this.image = core.assets[m.image];
		this.MAX_HP = m.hp;
		this.count = 0; // ダメージをカウントする
		this.x = core.width/2 - this.width/2;
		this.y = -100;
		this.tick2 = 0; // 攻撃を始めるまでの時間
		this.player = player;
		this.atkTick = 18 - (clearCount*5); // 攻撃の間隔を管理する変数
		if(this.atkTick <= 8) this.atkTick = 18;
		m.number == 3 ? this.tick = 1000 : this.tick = 0;
		scene.addChild(this);
		
		this.tl.moveBy(0, 100, 50);
		if(m.number == 3){
			this.tl.moveTo(0, 10, 100)
					.moveTo(core.width - this.width, 10, 100)
					.loop();
		}
		else if(m.number == 2){
			this.tl.moveTo(core.width - this.width, 10, 100)
					.moveTo(0, 10, 100)
					.loop();
		}
		else{
			this.tl.moveTo(0, 10, 100)
					.moveTo(core.width - this.width, 10, 100)
					.loop();
		}
		
		this.onenterframe = function(){
			this.tick ++;
			this.tick2 ++;
			
			// 弾発射
			if(this.tick % this.atkTick == 0 && this.tick2 > 50){
				// プレイヤーと敵の距離と角度を求める
				var sx = (player.x + player.width / 2) - (this.x + this.width/2 + 7);
          		var sy = (player.y + player.height / 2) - (this.y + this.height/2 + 25);
          		var angle = Math.atan(sx / sy);
          		var sx = (player.x + player.width / 2) - (this.x + this.width/2 - 23);
          		var angle2 = Math.atan(sx / sy);
				var rBullet = new BossBullet(this.x + this.width/2 + 7, this.y + this.height/2 + 25, angle, this.player, scene);
				var lBullet = new BossBullet(this.x + this.width/2 - 23, this.y + this.height/2 + 25, angle2, this.player, scene);
			}
		};
	},
	remove: function(scene){
		scene.removeChild(this);
		delete this;
	}
});

// プレイヤーの弾クラス
var Bullet = Class.create(Sprite, {
	initialize: function(x, y, scene){
		Sprite.call(this, 16, 16);
		this.image = core.assets['icon0.png'];
		//this.image = core.assets['space0.png'];
		this.frame = 48;
		this.x = x;
		this.y = y;
		this.vy = 8;
		scene.addChild(this);
		
		this.onenterframe = function(){
			this.y -= this.vy;
			if(this.y < -this.height){
				this.remove(scene);
			}		
		};
	},
	remove: function(scene){
		scene.removeChild(this);
		delete bullets[this.key];
		delete this;
	}
});

// 敵の弾クラス
var EnemyBullet = Class.create(Sprite, {
	initialize: function(x, y, player, scene){
		Sprite.call(this, 16, 16);
		this.image = core.assets['icon0.png'];
		this.frame = 60;
		this.x = x;
		this.y = y;
		this.vy = 6;
		this.player = player;
		scene.addChild(this);
		
		this.onenterframe = function(){
			this.y += this.vy;
			if(this.y > core.height){
				this.remove(scene);
			}
			
			// プレイヤーが生存しているときのプレイヤーと弾の当たり判定
			if(playerIsAlive == true){
				if(this.within(this.player, 16)){
					playerIsAlive = false;
					var effect = new Effect(this.x - 5, this.y, scene);
					this.remove(scene);
					playerLife --;
				}
			}	
		};
	},
	remove: function(scene) {
		scene.removeChild(this);
		delete this;
	}
});

// ボスの弾クラス
var BossBullet = Class.create(Sprite, {
	initialize: function(x, y, angle, player, scene){
		Sprite.call(this, 16, 16);
		this.image = core.assets['icon0.png'];
		this.frame = 60;
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.speed = 5;
		this.player = player;
		scene.addChild(this);
		
		this.onenterframe = function(){
			if(this.y > core.height || this.y < 0 || this.x > core.width || this.x < 0){
				this.remove(scene);
			}
			this.x += this.speed * Math.sin(this.angle);
      		this.y += this.speed * Math.cos(this.angle);
      		
      		// プレイヤーが生存しているときのプレイヤーと弾の当たり判定
      		if(playerIsAlive == true){
				if(this.within(this.player, 16)){
					playerIsAlive = false;
					var effect = new Effect(this.x - 5, this.y, scene);
					this.remove(scene);
					playerLife --;
				}
			}	
		};
		
	},
	remove: function(scene) {
		scene.removeChild(this);
		delete this;
	}
});

var Effect = Class.create(Sprite, {
	initialize: function(x, y, scene) {
		Sprite.call(this, 16, 16);
		this.image = core.assets['effect0.png'];
		this.frame = 0;
		this.x = x;
		this.y = y;
		this.tick = 0;
		scene.addChild(this);
		this.onenterframe = function (){
			this.frame += 1;
			if(this.frame % 5 == 0){
				scene.removeChild(this);
				delete this;
			}
		};
	},
});

var MultiLabel = Class.create(Label, {
	initialize: function(align, y, text, color, scene) {
		Label.call(this);
		this.y = y;
		this.text = text;
		this.color = color;
		this.textAlign = align;
		scene.addChild(this);
	}
});

var rnd = function(num){
	return Math.floor(Math.random() * num + 1);
};

var rndSpan = function(num, num2, num3){
	while(true){
		var n = Math.floor(Math.random() * num2 + 1);
		if(n == num3) continue;
		if(n >= num){
			return n;
		}
	}
};
