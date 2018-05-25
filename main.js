const fs = require('fs');
const fetch = require('node-fetch');
const SteamID = require('steamid');

const apikey = "E84E479671BF539828C2D471A9FF835C"; //who cares

var helpers = //object of helper functions for steam/logs api
{
	getSteamId: function(username) //returns steamid64 from vanity url
	{
		return fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apikey}&vanityurl=${username}&format=json`)
			.then(res => res.json())
			.then(json => json.response.steamid)
			.catch(error => console.error(error));
	},

	getLogsProfile: function(vanityurl) //returns logs.tf profile url from vanity url
	{
		return `https://logs.tf/profile/${vanityurl}`;
	},

	fetchPlayerLogs: function(id) //returns all logs from a player id
	{
		return fetch(`https://logs.tf/json_search?player=${id}`)
			.then(res => res.json());
	},

	sliceLogList: function(json, num) //cuts off log json at given interval
	{
		return json.logs.slice(0, num);
	},

	getLogDataFromID: function(id) //returns actual log data from a log id
	{
		return fetch(`https://logs.tf/json/${id}`)
			.then(res => res.json())
	},

	getClassStatsFromLog: async function(log, id)
	{
		var sid = new SteamID(id);
		var steam3ID = sid.getSteam3RenderedID(); //ugh

		var data = await this.getLogDataFromID(log);

		var players = data["players"];
		var stats = [];
		Object.keys(players).forEach(function(key) 
		{
			var player = players[key];
			console.log(`found player ${key}`);
			if(key == steam3ID)
			{
				console.log("found");
				stats = player;
			}
		});
		return stats;
	},

	getAvgPlayerStats: async function(id, num)
	{
		var logs = await this.fetchPlayerLogs(id);
		var sliced_logs = this.sliceLogList(logs, num);
		
		var dpm_sum = 0;
		var kills_sum = 0;
		var deaths_sum = 0;
		var assists_sum = 0;

		sliced_logs.forEach(async function(item){
			var log_id = item.id;

			var stats = await helpers.getClassStatsFromLog(log_id, id);
			if(stats)
			{
				console.log("yes");
				dpm_sum += stats["dapm"];
				kills_sum += stats["kills"];
				deaths_sum += stats["deaths"];
				assists_sum += stats["assists"];
				console.log(stats["dapm"]);
			}
		});

		var dpm_avg = dpm_sum / num;
		var kills_avg = kills_sum / num;
		var deaths_avg = deaths_sum / num;
		var assists_avg = assists_sum / num;

		console.log(dpm_avg + " is dpm");
	}
}

//helpers.fetchPlayerLogs(`76561198062263639`)
//	.then(logs => console.log(helpers.sliceLogList(logs, 3)))

//helpers.getLogDataFromID(`2030456`)
//	.then(res => console.log(res));

helpers.getAvgPlayerStats(`76561198062263639`, 3);