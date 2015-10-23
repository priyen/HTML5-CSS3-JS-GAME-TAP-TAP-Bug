// JavaScript Document
"use strict";

class Food {
	constructor(x, y){
		this.state = 'game';
		this.id = 'food';
		this.type = 'circle';
		this.cx = x;
		this.cy = y;
		this.radius = 5;
		this.fillStyle = '#FFFFFF';
		this.lineWidth = 1;
		this.strokeStyle = '#000000';
	}
}

class Bug {
  constructor( x, y, bugtype, angle) {
	this.state = 'game';
	this.type = 'bug';
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.bugtype = bugtype;
	this.lvl2smulti = 4/3; 
	this.alpha = 1;
	this.dead = false;
	this.lastUpdateTime = new Date().getTime();
	switch(bugtype){
		case "Black":
			this.baseSpeed = 150;
			this.value = 5;
			break;
		case "Red":
			this.baseSpeed = 75;
			this.value = 3;
			break;
		case "Orange":
			this.baseSpeed = 60;
			this.value = 1;
			break;
	}
  }
}

var currentMenu = "start";
var viewport;
var viewportX;
var viewportY;
var c;
var elements = []; //Elements
var gameElements = [];
var paused = false;
var lvl = 1;
var score = 0;
var highestlvl1score;
var highestlvl2score;
var time = 0;
var spawntimeout;
var renderMS=1;
var timeMS=1;
var renderTimeOld = new Date().getTime();
var timerTimeOld = new Date().getTime();
var spawnTimeElapsed = new Date().getTime();
var startpage;
var gamepage;
//food
var foods = [];

//Push Elements
elements.push({
	state: "all",
	id: "viewportBorder:",
	x: 0,
	y: 50,
	width: 400,
	height: 0,
	angle: 20,
	fillStyle: "#FFFFFF",
	type: "rect",
	strokeStyle: 'black',
	lineWidth: 5
});

var timerobj = {
	state: 'game',
	id:"timer",
	type:"text",
	font:"24px Arial",
	text:"60 sec",
	fillStyle:"#000000",
	x: 25,
	y: 35
};

elements.push(timerobj);

elements.push({
	state: 'game',
	id: "pausebutton",
	x: 135,
	y: 10,
	width: 130,
	height: 35,
	angle: 0,
	fillStyle: "#FFFFFF",
	type: "rect",
	strokeStyle: 'black',
	lineWidth: 3
});

var pausetextobj ={
	state: 'game',
	id:"pausetext",
	type:"text",
	font:"24px Arial",
	text:"||Pause||",
	fillStyle:"#000000",
	x: 155,
	y: 35
}
elements.push(pausetextobj);

var scoreobj = {
	state: 'game',
	id:"scoretext",
	type:"text",
	font:"24px Arial",
	text:"Score: 0",
	fillStyle:"#000000",
	x: 275,
	y: 35
};

elements.push(scoreobj);

 
function loaded(){
	startpage = document.getElementById('startpage');
	gamepage = document.getElementById('gamepage');
	viewport = document.getElementById("viewport");
	currentMenu = "start";
	c = viewport.getContext('2d');
	viewportX = viewport.offsetLeft;
	viewportY = viewport.offsetTop;
	highestlvl1score = localStorage.getItem("highestlvl1score");
	highestlvl2score = localStorage.getItem("highestlvl2score");
	if(highestlvl1score === null){
		highestlvl1score = 0;
	}
	if(highestlvl2score === null){
		highestlvl2score = 0;	
	}
	var hstext = document.getElementById('hstext');
	hstext.innerHTML = 'High Scores: ' + "Lv1 ("+highestlvl1score+") - Lv2 ("+highestlvl2score+")";
	setInterval(render, renderMS);
	setInterval(game, renderMS);
	setInterval(timef, timeMS);
	spawn();
}

function timef(){
	if(time > 0 && paused === false){
		var newTime = new Date().getTime();
		time = time - (newTime - timerTimeOld)/1000;
		timerobj.text = Math.floor(time) + ' sec';	
	}
	if(time <= 0 && currentMenu === "game" && paused === false){
		if(foodStillExist() === true){
			won(lvl);	
		}
		else{
			lost(lvl);
		}
	}
	if(time > 0 && paused === false){
		var foode = foodStillExist();
		if(foode === false){
			lost(lvl);	
		}
	}
	timerTimeOld = new Date().getTime();
}

function won(lv){
	if(lv === 1){
		alert('Won Level 1. Score: ' + score + '. Highest: ' + highestlvl1score + '. Advancing to Level 2.');
		endGame();
		lvl = 2;
		startGame(2);			
	}
	else if(lv === 2){
		alert('Won Level 2. Score: ' + score + '. Highest: ' + highestlvl2score + '.');
		var r = confirm('Press OK to restart at Level 1 or Cancel to return to main menu/start screen');
		endGame();
		if(r === true){
			lvl = 1;
			startGame(1)
		}
	}
}

function bugsStillExist(){
	elements.forEach(function(e){
		if(e.type === "bug"){
			return true;	
		}
	});
}

function foodStillExist(){
	var i;
	for (i = 0; i < elements.length; i++){
		if(elements[i].id === "food"){
			return true	;
		}
	}
	return false;
}

function lost(lv){var restart = window.confirm("Lost Level " + lvl + ". Restart?");
	if(restart === true){
		endGame();
		startGame(lv);
	}
	else{
		endGame();
	}	

}

function endGame(){
	startpage.style.display = "block";
	gamepage.style.display = "none";
	removeBugs();
	removeFood();		
	paused = false;
	currentMenu = "start";
	time = 0;
	updateHighscores();
}

function updateHighscores(){
	if(lvl === 1 && score > highestlvl1score){
		highestlvl1score = score;	
	}
	else if(lvl === 2 && score > highestlvl2score){
		highestlvl2score = score;
	}
	score = 0;
	if(typeof(Storage) !== "undefined") {
		localStorage.setItem("highestlvl1score", highestlvl1score);
		localStorage.setItem("highestlvl2score", highestlvl2score);
	} else {
    	alert('No localStorage support, scores will not save.');
	}
	var hstext = document.getElementById('hstext');
	hstext.innerHTML = "High Scores: " + "Lv1 ("+highestlvl1score+") - Lv2 ("+highestlvl2score+")";
	scoreobj.text = "Score: " + score;
}

function removeBugs(){
	var i;
	for (i = 0; i < elements.length; i++){
		if(elements[i].type === "bug"){
			elements.splice(i, 1);
			removeBugs();
			return;
		}
	}
	return;
}

function removeFood(){
	elements.forEach(function(e){
		if(e.id === "food"){
			elements.splice(elements.indexOf(e), 1);
		}
	});	
}

function spawn(){
	if(currentMenu === "game" && paused == false){		
		var x = (Math.random() * 380) + 10;
		var y = 50;
		var prob = Math.random();
		var bug;
		if(prob <= 0.3){
			bug = new Bug(x,y,"Black",0);	
		}
		else if(prob <= 0.6){
			bug = new Bug(x,y,"Red",0);
		}
		else if(prob <= 1){
			bug = new Bug(x,y,"Orange",0);
		}
		elements.push(bug);
	}
	var next = Math.random() * 2000 + 1000;
	spawntimeout = setTimeout(spawn, next);	
}

function getNearestMultiple(n, num){
	if(n > 0)
        return Math.ceil(n/num) * num;
    else if( n < 0)
        return Math.floor(n/num) * num;
    else
        return num;
}

function updateBugPosition(e){
	var currTime = new Date().getTime();
	var elapsed = e.lastUpdateTime - currTime
	currTime = new Date().getTime();
	e.lastUpdateTime = currTime;
	if(paused === true){
		return;
	}
	var data = getNearestFoodLocation(e);
	var f = data[0];
	var fx = f.cx;
	var fy = f.cy;
	var distToFood = data[1];
	//rotate the bug towards the food
	var tx = fx - e.x;
	var ty = fy - e.y;
	var rot =180/Math.PI * Math.atan2(ty, tx);
	
	if(rot >= 360){
		rot = rot - 360;	
	}
	if(rot < 0){
		rot = rot + 360;	
	}
	if (e.angle !== rot){//just rotate it
		if(rot > e.angle){
			e.angle = e.angle + 3;	
		}
		else{
			e.angle = e.angle - 3;	
		}
		if(Math.abs(e.angle - rot) <= 3){
			e.angle = rot;	
		}
	}
	if(distToFood > 50){
		e.travelRot = rot;
	}
	var speed = e.baseSpeed;
	if(lvl == 2){
		speed = e.baseSpeed * e.lvl2smulti;
	}
	var vx = (elapsed) * Math.cos(rot) * speed * timeMS/1000;
	var vy = (elapsed) * Math.sin(rot) * speed * timeMS/1000;
	e.x = e.x - vx;
	e.y = e.y - vy;
		
	if(distToFood < 26){
		elements.splice(elements.indexOf(f), 1);
	}				
}

function game(){
	if(currentMenu === 'game' && paused === false){
		elements.forEach(function(e) {
			if(e.type === 'bug' && e.dead === false){
				
			}
		});
	}
	renderTimeOld = new Date().getTime();
}

function getNearestFoodLocation(b){
	var x = b.x;
	var y = b.y;
	var smallestDist = 999;
	var f;
	elements.forEach(function(e){
		if(e.id === "food"){
			var d = getDistToPoint(x, y, e.cx, e.cy);
			if(d<smallestDist){
				smallestDist = d;
				f = e;
			}
		}
	});
	return [f, smallestDist];
}

function render(){
	
	c.clearRect(0, 0, viewport.width, viewport.height);
			elements.forEach(function(e) {
				if (e.state === "all" || e.state === currentMenu){				
				c.save();
				c.beginPath();
				switch(e.type){
					case "rect":				
						c.rect(e.x,e.y,e.width,e.height);
						c.fillStyle = e.fillStyle;
						c.lineWidth = e.lineWidth;
						c.stroleStyle = e.strokeStyle;
						c.stroke();
						break;
					case "text":
						c.font = e.font;
						c.fillStyle = e.fillStyle;
						c.fillText(e.text, e.x, e.y);
						break;
					case "circle":
						c.fillStyle = e.fillStyle;
						if(e.id === 'food'){
							c.fillStyle = 'yellow';
							c.arc(e.cx-5, e.cy+1, e.radius-2,	0, 2*Math.PI, false);
							c.arc(e.cx+5, e.cy+1, e.radius-2,	0, 2*Math.PI, false);
						}
						c.arc(e.cx, e.cy, e.radius,	0, 2*Math.PI, false);
						c.fill();
						c.strokeStyle = e.strokeStyle;
						c.lineWidth = e.lineWidth;
						c.stroke();
						break;
					case "bug":
						if(e.dead === true){
							var timeNow = new Date().getTime();
							e.alpha = e.alpha - 0.015;
							if(e.alpha < 0){
								e.alpha = 0;
								removeBug(e);	
							}
						} 
						else{
							updateBugPosition(e);
						}
						c.globalAlpha = e.alpha;
						//Make body
						c.translate(e.x, e.y);
						c.rotate(e.angle*Math.PI/180);
						c.moveTo(0,0);
						c.scale(3,1);
						c.arc(0, 0, 5, 0, 2*Math.PI, false);
						c.fillStyle = e.bugtype;
						c.fill();
						c.strokeStyle = 'red';
						c.lineWidth = 1;
						c.stroke();
						c.restore();
						//Make head						
						c.save();
						c.globalAlpha = e.alpha;
						c.translate(e.x, e.y);
						c.rotate(e.angle*Math.PI/180);
						c.moveTo(0,0);
						c.beginPath();
						c.arc(20, 0, 5, 0, 2*Math.PI, false);
						c.fillStyle = e.bugtype;
						c.fill();
						c.strokeStyle = 'red';
						c.lineWidth = 1;
						c.stroke();
						c.restore();
						//Make top eye
						c.save();
						c.globalAlpha = e.alpha;
						c.translate(e.x, e.y);
						c.rotate(e.angle*Math.PI/180);
						c.moveTo(0,0);
						c.beginPath();
						c.arc(23, -3, 2, 0, 2*Math.PI, false);
						c.fillStyle = e.bugtype;
						c.fill();
						c.strokeStyle = 'red';
						c.lineWidth = 1;
						c.stroke();
						c.restore();
						//Make bottom eye
						c.save();
						c.globalAlpha = e.alpha;
						c.translate(e.x, e.y);
						c.rotate(e.angle*Math.PI/180);
						c.moveTo(0,0);
						c.beginPath();
						c.arc(23, 3, 2, 0, 2*Math.PI, false);
						c.fillStyle = e.bugtype;
						c.fill();
						c.strokeStyle = 'red';
						c.lineWidth = 1;
						c.stroke();
						c.restore();
						//Make Legs
						c.save();
						c.globalAlpha = e.alpha;
						c.translate(e.x, e.y);
						c.rotate(e.angle*Math.PI/180);
						c.moveTo(0,0);
						c.beginPath();
						c.arc(2, -7, 2, 0, 2*Math.PI, false);
						c.arc(10, 3, 2, 0, 2*Math.PI, false);
						c.arc(2, 7, 2, 0, 2*Math.PI, false);
						c.arc(10, 1, 2, 0, 2*Math.PI, false);
						c.fillStyle = e.bugtype;
						c.fill();
						c.strokeStyle = 'red';
						c.lineWidth = 1;
						c.stroke();
						break;		
				}
				c.restore();
				}
			});
	renderTimeOld = new Date().getTime();
}

function addScore(s){
	score = score + s;
	scoreobj.text = 'Score: ' + score;
}

function removeBug(e){
	elements.splice(elements.indexOf(e), 1);	
}

function getDistToPoint(sx, sy, tx, ty){
	var d = Math.sqrt(Math.pow(sx-tx, 2) + Math.pow(sy-ty, 2));
	return d;
}

function makeFoods(){	
	while(foods.length < 5){
		var y = 170 + (Math.random() * 460); //ensure not in top 20% viewport 50->650, 20% < 170px
			//should be 480 but need to leave space for food radius			
		var x = 20 + (Math.random() * 360); //leaving space for radius
		var make = true; //create food
		if(foods.length === 0){
			make = true;
		}
		else{
			foods.forEach(function(e){
				var d = getDistToPoint(x,y,e[0],e[1]);
				if(d < 50){ //prevent overlap
					make = false;
				}
			});
		}
		if(make === true){
			foods.push([x,y]);
		}
	};	
	
	foods.forEach(function(e){
		var f = new Food(e[0], e[1]);	
		elements.push(f);
	});
}

function startGame(lv){
	startpage.style.display = "none";
	gamepage.style.display = "block";
	renderTimeOld = new Date().getTime();
	timerTimeOld = new Date().getTime();
	makeFoods();
	lvl = lv;
	currentMenu = "game";
	time = 60;
	paused = false;
}

function togglePause(){
	if(paused===false){
		paused = true;
		pausetextobj.text = "||Play||";
	}
	else if(paused === true){
		paused = false;
		renderTimeOld = new Date().getTime();
		timerTimeOld = new Date().getTime();
		pausetextobj.text = "||Pause||";
	}
}

function clickedStartButton(){
	if(currentMenu === 'start'){
		var radiobtns = document.getElementsByName('level');
		for(var i=0, length = radiobtns.length; i < length; i++){
			if(radiobtns[i].checked){
				lvl = radiobtns[i].value;
				break;
			}
		}
		startGame(lvl);
	}
}

addEventListener('click', function(src) {
	elements.forEach(function(e){
					var x = src.pageX - viewportX;
    				var y = src.pageY - viewportY;
					switch(e.type){
						case "rect":
							if (x > e.x && x < e.width + e.x && y > e.y && y < e.height + e.y) {
            					switch(e.id){
									case "pausebutton":
										if(currentMenu === 'game'){
											togglePause();
										}
										break;
								}	
							}
							break;
						case "bug":
							if(currentMenu === 'game' && (paused === false)){
								x = x - e.x;
								y = y - e.y;
								var distf = Math.sqrt(x*x + y*y);
								if(distf <= 30 && e.dead !== true){ //radius to kill bug
									e.dead = true;
									addScore(e.value);
								}
							}
							break;
					}
				}
			);
}, false);


