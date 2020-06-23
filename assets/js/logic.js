var clientFilms = []
const relevantProperties = ["episode_id", "title", "opening_crawl", "director", "producer", "release_date"];
var toggleState = 0;

$(document).ready(function() {
	getFilms();
	initButtons();
});

function getFilms(){
	$.ajax({
		url: 'https://swapi.dev/api/films/',
		dataType: 'json',
		success: (data) => {
			let films = data.results;
			films.forEach((item, index) => {
					let attributes = Object.getOwnPropertyNames(item);
					attributes.forEach((attribute)=> {
						if(!relevantProperties.includes(attribute)) {
							delete item[attribute];
						}
					});
			
					formerSelection = localStorage.getItem(item.episode_id)
					if(formerSelection !== null) {
						item.favorite = formerSelection == 'true';
					} else {
						item.favorite = false;
					}
			});

			clientFilms = films.sort((film1, film2) => { return film1.episode_id - film2.episode_id;});
			initFilmsTable();
		},
		error: (message) => {
			console.log(message);
		}
	});
}

function checkBoxToggle(e) {
    if(this.checked) {
        localStorage.setItem(e.srcElement.value, this.checked);
    } else {
		localStorage.removeItem(e.srcElement.value);
    }
	
	updateFilmState(e.srcElement.value, this.checked);
	showAllFilmsByParam(toggleState);
}

function updateFilmState(id, value){
	clientFilms.forEach((film) => {
		if(film.episode_id == id){
			film.favorite = value;
		}
	});
}

function initCheckBox(id){
	let checkbox = $(`#myCheckbox${id}`)[0];
	if(localStorage.getItem(id) !== null){
		checkbox.checked = true;
	}
	checkbox.addEventListener( 'change', checkBoxToggle);
}

function createTableRow(film){
	let tbody = ""
	Object.entries(film).forEach(([key, value])=> {
		if(typeof value === "boolean"){
			tbody += "<td>" + `<input type="checkbox" id="myCheckbox${film.episode_id}" value=${film.episode_id} />` + "</td>";
		}
		else{
			if(key !== "episode_id"){
				tbody += "<td>" + value + "</td>";
			}
		}
	});
	tbody = `<tr id="tr${film.episode_id}">${tbody}</tr>`;
	$("#table_body").append(tbody);
	initCheckBox(film.episode_id);
}

function createTableHead(attributes){
	let thead = ""
	attributes.forEach((attribute)=> {
		if(attribute !== "episode_id"){
			thead += "<td>" + normalizeProperty(attribute) + "</td>";
		}
	});
	thead = `<tr>${thead}</tr>`;
	$("#table_head").append(thead);
}

function initFilmsTable(){
	createTableHead(relevantProperties);
	if(clientFilms.length > 0){
		clientFilms.forEach((film, index) => {
							createTableRow(film);
						});
	} else {
		$("#table_body").append("<tr><td colspan=" + relevantProperties.length + ">No films exists</td></tr>");
	}
}

function initButtons(){
	// clear favorites
	let button_clear_favorites = $('#btn_clear_favorites');
	button_clear_favorites.on('click', () => {
			localStorage.clear();
			for(let id of getFilmsIds()){
				var checkbox = $(`#myCheckbox${id}`)[0];
				checkbox.checked = false;
			}
			
			resetFilmsCheckboxes();
			showAllFilmsByParam(toggleState);
	});
	
	// toggle films
	let button_films_toggle = $('#films_toggle');
	const toggle_states_names = ['All Films', 'Favorite Films', 'Other Films'];
	button_films_toggle.on('click', () => {
		toggleState = (toggleState + 1) % toggle_states_names.length
		button_films_toggle.text(toggle_states_names[toggleState]);
		showAllFilmsByParam(toggleState);			
	});
}

function showAllFilmsByParam(state){
	const toggle_states_filters = ['any', true, false];
	clientFilms.forEach((film)=>{
		let table_row = $(`#tr${film.episode_id}`)[0];
		if(film.favorite == toggle_states_filters[state] || toggle_states_filters[state] == 'any'){
			table_row.style.display = '';
		}
		else{
			table_row.style.display = 'None';
		}
	});
}

function resetFilmsCheckboxes(){
		clientFilms.forEach((film) =>{
		updateFilmState(film.episode_id, false);
	});
}

function getFilmsIds(){
		films_ids = clientFilms.map((film) => {
		return film.episode_id;
	});
	return Object.values(films_ids);
}

function normalizeProperty(value){
	return (value.charAt(0).toUpperCase() + value.slice(1)).replace('_', ' ');
}