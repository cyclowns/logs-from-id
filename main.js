const fs = require('fs');
const fetch = require('node-fetch');
const SteamID = require('steamid');
const Promise = require('promise');
const readline = require('readline');

const apikey = "E84E479671BF539828C2D471A9FF835C"; //who cares

var helpers = //object of helper functions for steam/logs api
{
	getSteamId: function(username) //returns steamid64 from vanity url
	{
		return fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apikey}&vanityurl=${username}`)
			.then(res => res.json())
			.then(json => json.response.steamid)
			.catch(error => console.error(error));
	},

	getLogsProfile: function(id) //returns logs.tf profile url from steam id
	{
		return `https://logs.tf/profile/${id}`;
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
		var steam3ID = sid.getSteam3RenderedID(); //ugh, id conversion

		var data = await this.getLogDataFromID(log);

		var players = data["players"];
		var stats = [];
		Object.keys(players).forEach(function(key) 
		{
			var player = players[key];
			if(key == steam3ID)
			{
				stats = player;
			}
		});
		return stats;
	},

	getAvgPlayerStats: async function(id, num)
	{
		var logs = await this.fetchPlayerLogs(id);
		var sliced_logs = this.sliceLogList(logs, num);
		
		var stat_list = {
			dpm: {
				sum: 0,
				avg: 0
			},
			kills: {
				sum: 0,
				avg: 0
			},
			assists: {
				sum: 0,
				avg: 0
			},
			deaths: {
				sum: 0,
				avg: 0
			}
		};

		//I FUCKIN HATE PROMISES AAAAAAAAAA
		var counter = sliced_logs.length - 1;
		var log_promise = new Promise(function(resolve, reject){
			sliced_logs.forEach(function(item)
			{
				var log_id = item.id;

				var stats = helpers.getClassStatsFromLog(log_id, id)
					.then(function(stats)
					{
						//ugly but whatever
						stat_list.dpm.sum  += stats["dapm"];
						stat_list.kills.sum += stats["kills"];
						stat_list.deaths.sum += stats["deaths"];
						stat_list.assists.sum += stats["assists"];
						if(counter === 0)
						{
							resolve();
						}
						counter--;
					});
			});
		});

		return log_promise.then(function(){
			stat_list.dpm.avg = stat_list.dpm.sum / num;
			stat_list.kills.avg = stat_list.kills.sum / num;
			stat_list.deaths.avg = stat_list.deaths.sum / num;
			stat_list.assists.avg = stat_list.assists.sum / num;
			return stat_list;
		});

	}
}

function startInput() //starts the input in console
{
	process.argv.forEach(async function(val, index, array){
		if(index == 0 || index == 1) return;
		console.log(`Stats for player ${index - 1}, ${val}`);
		var id;
		try
		{
			var id = new SteamID(val);
		}
		catch(e) //invalid format
		{
			var id = await helpers.getSteamId(val);
		}
		var stats = await helpers.getAvgPlayerStats(id, 10)
		console.log(`for the past 10 logs:`)
		console.log(`Average DPM: ${stats.dpm.avg}`);
		console.log(`Average kills: ${stats.kills.avg}`);
		console.log(`Average deaths: ${stats.deaths.avg}`);
		console.log(`Average assists: ${stats.assists.avg}`);
	});
}

startInput();

//helpers.getAvgPlayerStats(`76561198062263639`, 5)
//	.then(function(statlist){
//		console.log(statlist.kills.avg);
//	});
