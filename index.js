var children = [];

async function openclient(cookiehere, gameid, jobid) {
	let authticket = null
	let version = null
	const delay = require('delay');
	const {
		exec
	} = require("child_process");
	const noblox = require('noblox.js')
	const cookie = cookiehere
	var XCSRF = "If you see this something messed up"
	async function getxscrf() {
		const currentUser = await noblox.setCookie(cookie)
		//Use noblox to set the cookie it is going to use
		console.log(`Preparing to join using ${currentUser.UserName} [${currentUser.UserID}]`)
		XCSRF = await noblox.getGeneralToken()
		//Get the xcsrf token using noblox, would have helped to know this earlier :/
		console.log(`Got XCSRF token: ${XCSRF}`);
	}
	await getxscrf()
	const axios = require('axios')
	async function authticketroblox() {
		let dumb = 1;
		//Axios post request to get an auth ticket
		dumb = axios({
			method: 'POST',
			url: 'https://auth.roblox.com/v1/authentication-ticket',
			maxRedirects: 0,
			//Prevent redirects, useless but has no reason to be removed
			data: {},
			headers: {
				'x-csrf-token': XCSRF,
				'referer': 'https://www.roblox.com/', //>:(
				Cookie: `.ROBLOSECURITY=${cookie}`
			}
		}).then(response => {
			console.log(`YOOO AUTH TICKET LETS GO ${response.headers['rbx-authentication-ticket']}`)
			authticket = response.headers['rbx-authentication-ticket']
		}).catch(err => {
			console.log(err.response.data)
		})
	}
	await authticketroblox()
	//Axios get request to get the version number of roblox, so you dont have to update the script everytime you update roblox
	async function robloxversion() {
		axios({
			method: 'GET',
			url: 'https://s3.amazonaws.com/setup.roblox.com/version',
			maxRedirects: 0,
			//Prevent redirects, useless but has no reason to be removed
			data: {},
			headers: {}
		}).then(response => {
			console.log(`Current roblox version: ${response.data}`)
			version = response.data
		}).catch(err => {
			console.log(err.response.data)
		})
	}
	await robloxversion()
	//Set variable time to current time in utc
	let time = new Date().getTime()
	//Get browser id ( >:( )
	var browseridlink = "Oops"
	async function urlroblox() {
		browseridlink = `https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGameJob^&browserTrackerId=${time}^&placeId=${gameid}^&gameId=${jobid}^&isPlayTogetherGame=false`
		console.log(browseridlink)
	}
	await urlroblox()
	await delay(1000)
	async function openroblox() {
		await delay(1000)
		var launchoptions = `"C:/Program Files (x86)/Roblox/Versions/${version}/RobloxPlayerBeta.exe" --play -t ${authticket} -j ${browseridlink} -b ${time} --launchtime=${time} --rloc en_us --gloc en_us`
		console.log(launchoptions)
		children.push(exec(launchoptions).pid)
	}
	openroblox()
	//func end, dont place below here
	setTimeout(() => {
		require('robotjs').mouseClick();
	}, 10000);
}

exports.openclient = openclient

function jump() {
	require('robotjs').mouseClick();
	require('robotjs').keyTap("space");
}

function killall() {
	console.log("If This ever says killing 2, something is broken very bad")
	console.log('killing', children.length, 'child processes');
	children.forEach(function(child) {
		var spawn = require('child_process').spawn;
		spawn("taskkill", ["/pid", children, '/f', '/t']);
		//Remove the child process from the array
		children.splice(children.indexOf(child), 1);
	});
};
//killall() No arguments as of yet
exports.killall = killall
