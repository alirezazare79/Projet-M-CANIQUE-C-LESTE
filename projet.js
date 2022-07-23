"use strict" // Nous empêche d'utiliser des variables non déclarées

$(document).ready(function (){




// Accès au canvas défini dans la structure HTML
var canvas = document.getElementsByTagName("canvas")[0]; // get the actual DOM element
var ctx = canvas.getContext("2d");




// Retourne un entier compris dans [min;max[
function genereNombre(min, max){
 return Math.floor((Math.random()*(max-min))+min)
}


// Génère une couleur hexa aléatoirement.
// Snippet récupéré sur https://stackoverflow.com/a/1484514
function getRandomColor() {
 let letters = '0123456789ABCDEF';
 let color = '#';
 for (let i = 0; i < 6; i++)
 color += letters[Math.floor(Math.random() * 16)];
 return color;
}








// --------------VARIABLES / CONSTANTES--------------
// --------------------------------------------------

const zone = document.getElementById("affichage"); // canvas
const controles = document.getElementById("controles_cont"); // zone qui contient le titre "Particules" et les contrôles
const toggleBar = document.getElementById("controles_aff"); // zone cliquable pour masquer/afficher le menu
const arrow = document.getElementById("arrow"); // la flèche tournante!
const aff_mas = document.getElementById("status"); // texte "Masquer les contrôles/Afficher les contrôles"
const part_titre= document.getElementById("particules"); // titre "Particules"
const formulaire = document.getElementById("formulaire"); // formulaire de contrôles

var taille = document.getElementById("valeur_masse"); // texte du range
var masse = document.getElementById("masse"); // valeur du range

var couleur = document.getElementById("couleur"); // valeur du color picker

var mouseX; // variable qui nous servira à avoir la position en X de la souris
var mouseY; // variable qui nous servira à avoir la position en Y de la souris

const N = 20; // nombre de particules aléatoires au chargement de page
var tpart = []; // tableau qui dénombre les particules
var coul_rand = getRandomColor(); // couleur choisie au hasard

const G = 1; // constante de gravitation
const dt = 0.2; // constante de vitesse d'affichage

const demarrer = document.getElementById("demarrer"); // bouton "Démarrer"
const stop = document.getElementById("stop"); // bouton "Stop"
const vitesse = document.getElementById("vitesse"); // bouton "x1"
	var vit_status = 1; // étape de la vitesse (pour les clique sur le bouton)
const slider = document.getElementById("slider"); // contient le rond du bouton toggle
const check = document.getElementById("check"); // rond du bouton toggle
	var fixer_status = false; // À false, la particule ajoutée n'est pas fixée, à true elle l'est


var once = true; // empêche le bouton "Démarrer" d'activer l'animation plusieurs fois et donc de l'accélérer
var timer = 10; // l'animation s'effectue toute les 10ms au chargement de la page
var on_off = false; // si l'animation se joue ou non






// --------------MASSE AFFICHÉE--------------
// ------------------------------------------


taille.innerHTML = masse.value; // affiche la valeur initiale au chargement de la page


masse.addEventListener("input", afficher_masse); // détecte si l'input du range à été modifié

function afficher_masse() { //affiche la valeur à chaque changement d'input du range
	taille.innerHTML = masse.value;
}








// --------------MENU COULISSANT--------------
// -------------------------------------------

toggleBar.addEventListener("click", toggleMenu); // détecte le clique sur l'option

let status = false; // État de base avec les contrôles affichées

function toggleMenu() { // affiche ou masque les contrôles, et anime la flèche!
	if(status===false) {
		$("#controles_cont").slideUp(500); // animation de glissement à la fermeture
		arrow.style.cssText = "transform: rotate(180deg);" // animation de la flèche (avec la transition spécifiée dans le fichier css)
		aff_mas.innerHTML = "Afficher les contrôles" // changement du texte
		status=true; // change l'état à "fermé" pour le prochain clique
	} else {
		$("#controles_cont").slideDown(500); // animation de glissement à l'ouverture
		arrow.style.cssText = "transform: rotate(0deg);"
		aff_mas.innerHTML = "Masquer les contrôles"
		status=false;
	}
}






// --------------CONSTRUCTOR DE PARTICULES--------------
// -----------------------------------------------------

function Particule(masse,x,y) {
	this.masse = masse; // masse de la particule
	this.x = x; // coordonnée en x
	this.y = y; // coordonnée en y
	var a_dessiner; // booléen qui dit si la particule est ou non dans le canvas
	var vx; // vélocité en x
	var vy;	// vélocité en y
	var fx; // force appliquée sur x
	var fy; // force appliquée sur y
	var color = couleur.value; // couleur de la particule
	var fixee = false; // booléen qui dit si la particule est fixée ou non

	// ctx est la variable contenant le contexte du canvas, telle que définie ci-dessus
	this.draw = function(){
		ctx.beginPath();
		ctx.fillStyle = this.color; // couleur de la particule
		ctx.arc(this.x, this.y, this.masse/5, 0, Math.PI*2, true); // position, masse, angle/portion du cercle et sens de rotation à la définition du cercle
		ctx.closePath();
		ctx.fill(); // rempli l'arc créé
	};
}





// --------------AJOUT DE PARTICULES--------------
// -----------------------------------------------

zone.addEventListener("dblclick", ajout_part); // détecte le double-clique dans la zone
formulaire.addEventListener("dblclick", ajout_part); // détecte le double-clique dans la zone formulaire
part_titre.addEventListener("dblclick", ajout_part); // détecte le double-clique dans la zone "Particules"



function ajout_part(event) {
	mouseX = event.pageX - $('#affichage').offset().left; // coordonnée en x du curseur
	mouseY = event.pageY - $('#affichage').offset().top; // coordonnée en y du curseur
	

	let masse_nouveau = masse.value/4; // réduire la masse des particules ajoutées

	if(masse_nouveau<10)
		masse_nouveau = 10;
    if(masse_nouveau>120)
        masse_nouveau = 120; // uniformisation de la taille des particules ajoutées

	let partic = new Particule(masse_nouveau,mouseX,mouseY); // création d'une nouvelle particule
	partic.color = couleur.value; // assignation de la couleur choisie dans les contrôles à cette nouvelle particule

	let masse_rand = genereNombre(10,100); // assigne une taille aléatoire à chaque itération
	let rad; // intialisation de la variable rad
	let i = genereNombre(0,10);
	let ang = 2*(Math.PI)*i / N;


	if(masse_rand<50)
		rad = genereNombre(50,100);
	else
		rad = genereNombre(100,200); // deuxième niveau d'aléatoire avec rad, une variable utilisée dans les calculs de coordonnées et vélocité ci-dessous

	partic.vx = -0.005*rad*Math.cos(ang); // vélocité en x de la particule
	partic.vy = 0.005*rad*Math.sin(ang); // vélocité en y de la particule

	if(fixer_status==true)
		partic.fixee = true; // fixer la particule ajoutée si le status est à 1

	partic.draw(); // dessine la particule
	tpart.push(partic); // l'ajoute au tableau des particules
};








// --------------PARTICULE DU MILIEU--------------
// -----------------------------------------------

var milieu = new Particule(350,400,300); // création de la paticule centrale immobile
milieu.color = getRandomColor(); // couleur de cette particule
milieu.fixee = true; // détermine si la particule est fixée ou non (si non, il faut lui assigner une vélocité)
// milieu.vx = -0.005*75*Math.cos(2*(Math.PI) / N); si on veut retirer la fixation de la particule, il faut lui assigne une vélocité
// milieu.vy = 0.005*150*Math.sin(2*(Math.PI) / N);
milieu.draw(); // dessine cette particule
tpart.push(milieu); // ajoute la particule au tableau des particules









// --------------N PARTICULES ALÉATOIRES--------------
// ---------------------------------------------------

for(let i=0; i<N; i++) { // boucle indiquant le nombre N de particules que l'on veut
	let masse_rand = genereNombre(10,100); // assigne une taille aléatoire à chaque itération
	let rad = 0.0;
	let ang = 2*(Math.PI)*i / N;
	// rad et ang vont permettre de déterminer les positions et vélocités initiales des particules. Plus la masse d'une particule va être importante, plus celle-ci sera éloignée du centre du canvas

	if(masse_rand<50)
		rad = genereNombre(50,100);
	else
		rad = genereNombre(100,200); // deuxième niveau d'aléatoire avec rad, une variable utilisée dans les calculs de coordonnées et vélocité ci-dessous

	let x = $('#affichage').attr('width')/2 + rad*Math.sin(ang);
 	let y = $('#affichage').attr('height')/2 + rad*Math.cos(ang); // La position (en x et y) de chaque particule est aléatoire

 	if(masse_rand<30)
 		masse_rand = 50;
 	if(masse_rand>90)
 		masse_rand = 50; // uniformisation de la taille des particules

 	let p = new Particule(masse_rand, x, y); // on initialise la nouvelle particule
 	p.vx = -0.005*rad*Math.cos(ang); // vélocité en x de la particule
	p.vy = 0.005*rad*Math.sin(ang); // vélocité en y de la particule
	p.color = getRandomColor(); // couleur aléatoire de la particule
	p.draw(); // chaque particule est dessinée
	tpart.push(p); // chaque particule est ajoutée au tableau de particules
}










// --------------CALCUL DE DÉPLACEMENT DES PARTICULES--------------
// ----------------------------------------------------------------

function calculDeplacements(particules, dt) {
	for(let i=0; i<particules.length; i++) { // pour chaque particules
		if (particules[i].fixee === true) continue; // si la particule est fixee, sauter l'itération
		if (particules[i].a_dessiner === false) continue;

		particules[i].fx = 0; 
		particules[i].fy = 0; // initialisation à 0 des forces appliquées


		/* Calcul de la force appliquée à i par toutes les autres particules */
		for(let j=0; j<particules.length; j++) {
			if(i==j) continue; // sauter la force exercée par la particule sur elle-même

			let xj = particules[j].x;
			let xi = particules[i].x;
			let yj = particules[j].y;
			let yi = particules[i].y; // coordonnées des 2 particules

			let dx = xj - xi;
			let dy = yj - yi; // distance en x et y des deux particules

			let distance = Math.sqrt((dx*dx)+(dy*dy)); // distance par Théorème de Pythagore

			let r = Math.sqrt(distance + 1000);
			let F = (G * particules[j].masse) / (distance*distance); // calcul de la constante F (force appliquée sur la particule i)
			
		
			if(distance < 3) continue;
				particules[i].fx += F*dx/distance;
				particules[i].fy += F*dy/distance; // calcul de la force exercée en x et y sur la particule i
		}


		/* Calcul de la nouvelle position de la particule i avec la méthode d'Euler */
		let ax = particules[i].fx / particules[i].masse * 3;
		let ay = particules[i].fy / particules[i].masse * 3; // calcul de l'effet sur chaque particule en fonction de sa masse (masse plus grande => moins d'effet)

		particules[i].vx += ax * dt;
		particules[i].vy += ay * dt; // calcul de la vélocité en x et y

		particules[i].x += particules[i].vx * dt;
		particules[i].y += particules[i].vy * dt; // calcul de la position en x et y à partir de la vélocité


		if(particules[i].x < 0 || particules[i].x > (canvas.width) || particules[i].y < 0 || particules[i].y > (canvas.height)) // si les coordonnées de la particule (x et y) sont en dehors des dimensions du canvas, ne plus dessiner la fonction
			removeFromArray(particules, i);
	}
}






// --------------SUPPRIMER DU TABLEAU DE PARTICULES--------------
// --------------------------------------------------------------

function removeFromArray(tpart, i) {
	tpart[i].a_dessiner = false; // Si la particule est sortie du canvas, on ne la dessine plus
}











// --------------ANIMATION--------------
// -------------------------------------

var intervalID;


function animer(){ // permet de dessiner les particules à intervalle défini
	intervalID = setInterval(function(){ // setInterval permet de répéter la fonction (anonyme ici) à intervalle
		calculDeplacements(tpart, dt); // exécute la fonction calculDeplacements avec en paramètres le tableau de particules et l'intervalle d'exécution des calculs
		ctx.fillStyle = "#111111" // couleur du canvas
		ctx.fillRect(0, 0, canvas.width, canvas.height);  // redessine un rectangle de la taille du canvas
		for (let k=0; k<tpart.length; k++){ // pour chaque particule
			if (tpart[k].a_dessiner === false) continue; // si elle est à dessiner
			tpart[k].draw(); // la dessiner
		}
	}, timer); // code exécuté toutes les "timer" ms	(ici timer=10)
}











// --------------DÉMARRAGE / ARRÊT / VITESSE / FIXER LES PARTICULES--------------
// ------------------------------------------------------------------------------

demarrer.addEventListener("click", () => { // si l'on clique sur le bouton "Démarrer"
	if(once === true) {
		animer(); // exécuter la fonction animer
		once = false; // Le bouton a déjà été cliqué
		on_off = true; // l'animation se joue
	}
});


stop.addEventListener("click", () => { // si l'on clique sur le bouton "Stop"
	clearInterval(intervalID); // arrêter la boucle d'animation
	once = true; // on peut cliquer sur "Démarrer" à nouveau
	on_off = false; // l'animation ne se joue pas
});



vitesse.addEventListener("click", () => {
	if(on_off === true) { // si l'animation ne se joue pas
		if (vit_status == 1) {
			clearInterval(intervalID); // arrêter la boucle d'animation
			timer = 5; // l'animation s'effectuera toute les 5ms
			animer(); // relancer l'animation
			vit_status = 2; // passer à l'étape suivant au prochain clique
			vitesse.innerHTML = 'x2'; // changer le texte du bouton
			return; // arrêter l'écouteur d'évènements
		}

		if (vit_status == 2) {
			clearInterval(intervalID);
			timer = 1;
			animer();
			vit_status = 4;
			vitesse.innerHTML = 'x4';
			return;
		}

		if (vit_status == 4) {
			clearInterval(intervalID);
			timer = 10;
			animer();
			vit_status = 1;
			vitesse.innerHTML = 'x1';
			return;
		}
	}
})




slider.addEventListener("click", () => { // si l'on clique sur le bouton de type toggle
	if(fixer_status == true) { // si le bouton est à l'état "fixé"
		slider.style.cssText = "background-color: #b3b3b3;"; // change la couleur du bouton en gris 
		check.style.cssText = "transform: translateX(0px)"; // retourne le rond à sa position initiale

		fixer_status = false; // change l'état du bouton
		return; // arrête l'écouteur d'évènement
	}

	if(fixer_status == false) {
		slider.style.cssText = "background-color: #297ac2;"; // change la couleur du bouton en bleu 
		check.style.cssText = "transform: translateX(29px)"; // déplace le rond vers la droite

		fixer_status = true;
		return;
	}
});








});
