const fs = require('fs');
const fetch = require('node-fetch');

const apikey = "E84E479671BF539828C2D471A9FF835C"; //who cares

function getSteamId(username) //returns steamid64 from vanity url
{
	return fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apikey}&vanityurl=${username}`)
		.then(res => res.json())
		.then(json => json.response.steamid)
		.catch(error => console.error(error));
}

getSteamId("TwentyPlus")
	.then(res => console.log(res));