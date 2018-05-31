const fs = require('fs');
const fetch = require('node-fetch');
const SteamID = require('steamid');
const Promise = require('promise');

const apikey = "E84E479671BF539828C2D471A9FF835C"; //who cares

var helpers = //LAZINESS
{
	getSteamId: function(username) //returns steamid64 from vanity url
	{
		return fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apikey}&vanityurl=${username}`)
			.then(res => res.json())
			.then(json => json.response.steamid)
			.catch(error => console.error(error));
	}
}

function startInput()
{
	process.argv.forEach(async function(val, index, array){
		if(index == 0 || index == 1) return;
		var id;
		try
		{
			var sid = new SteamID(val);
			id = val;
		}
		catch(e) //invalid format
		{
			id = await helpers.getSteamId(val);
		}
		console.log(`https://logs.tf/profile/${id}`);
	});
}

startInput();