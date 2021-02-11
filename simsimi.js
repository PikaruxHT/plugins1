!global.data.simsimiList ? global.data.simsimiList = {
	"ping": "pong!"
} : "";

var fetch = global.nodemodule["node-fetch"];
var striptags = global.nodemodule.striptags;
var crypto = global.nodemodule.crypto;

//{ #region Libraries
function compareTwoStrings(first, second) {
	first = first.replace(/\s+/g, '')
	second = second.replace(/\s+/g, '')
	if (!first.length && !second.length) return 1;                   // if both are empty strings
	if (!first.length || !second.length) return 0;                   // if only one is empty string
	if (first === second) return 1;       							 // identical
	if (first.length === 1 && second.length === 1) return 0;         // both are 1-letter strings
	if (first.length < 2 || second.length < 2) return 0;			 // if either is a 1-letter string
	let firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram) + 1
			: 1;
		firstBigrams.set(bigram, count);
	};
	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram)
			: 0;
		if (count > 0) {
			firstBigrams.set(bigram, count - 1);
			intersectionSize++;
		}
	}
	return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

function findBestMatch(mainString, targetStrings) {
	if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');
	const ratings = [];
	let bestMatchIndex = 0;
	var oldRating = 0;
	for (let i = 0; i < targetStrings.length; i++) {
		const currentTargetString = targetStrings[i];
		const currentRating = compareTwoStrings(mainString, currentTargetString)
		ratings.push({target: currentTargetString, rating: currentRating})
		if (currentRating > ratings[bestMatchIndex].rating) {
			bestMatchIndex = i
		}
	}
	const bestMatch = ratings[bestMatchIndex]
	return { ratings, bestMatch, bestMatchIndex };
}

function areArgsValid(mainString, targetStrings) {
	if (typeof mainString !== 'string') return false;
	if (!Array.isArray(targetStrings)) return false;
	if (!targetStrings.length) return false;
	if (targetStrings.find(s => typeof s !== 'string')) return false;
	return true;
}

var random = function (min, max) {
  if (min > max) {
    var temp = min;
    min = max;
    max = temp;
  }
  var bnum = (max - min).toString(16).length / 2;
  if (bnum < 1) bnum = 1;
  return Math.round(parseInt(crypto.randomBytes(bnum).toString('hex'), 16) / Math.pow(16, bnum * 2) * (max - min)) + min;
};
//} #endregion

var simfunc = function (type, data) {
	var msg = data.args.slice(1).join(" ");
	var questionlist = [];
	for (var n in global.data.simsimiList) questionlist.push(n);
	var nearest = findBestMatch(msg.toLocaleLowerCase(), questionlist).bestMatch;
	var minimummatch = (random(80, 85) / 100);
	data.log("Nearest:", nearest.target, "|", (nearest.rating * 100).toFixed(2) + "%", "match", "|", (nearest.rating > minimummatch ? "OK" : "Fetch needed"), "|", "Minimum:", (minimummatch * 100).toFixed(2) + "%");
	if (nearest.rating > minimummatch) {
		return {
			handler: "internal",
			data: global.data.simsimiList[nearest.target]
		}
	} else {
		// Raw API URL extracted from app: https://secureapp.simsimi.com/v1/simsimi/talkset?uid=295781205&av=6.9.0.6&lc=vn&cc=&tz=Asia%2FJakarta&os=a&ak=zZfhY%2FfJo2UpdIuUjTJftPJvTf4%3D&message_sentence=b%C3%BA+c%E1%BA%B7c+anh+%C4%91i&normalProb=2&isFilter=1&talkCnt=0&talkCntTotal=0&reqFilter=0&session=Ub9BEwnCb4GB6ZhgCKbfS2HPv2EJCUnMmqEgx41SEdmJZQDmpGcNy8zad29p6QZjGTKoWAjVJfCZz7fuGxquNtQ4&triggerKeywords=%5B%5D

		const params = new URLSearchParams();

		let lc = (data.resolvedLang || global.config.language).slice(0, 2);
		switch (lc) {
			case "vi":
				lc = "vn";
				break;
		}

		params.set('lc', lc);
		params.set('message_sentence', msg);

		params.set('uid', "295781205"); // user id 🤔
		params.set('av', '6.9.0.6'); // simsimi app version
		params.set('cc', '');
		params.set('tz', 'Asia/Jakarta');
		params.set('os', 'a'); //Extracted from Android app lol.
		params.set('ak', 'zZfhY/fJo2UpdIuUjTJftPJvTf4=');

		// These 3 settings is used to set whether to filter out bad words. (idk the parameter so i just let the value as it.)
		params.set('normalProb', '0'); 
		params.set('isFilter', '8');
		params.set('reqFilter', '0');

		params.set('talkCnt', '0'); // Talk count? weird.
		params.set('talkCntTotal', '0');
		
		// I'm afraid that the session key will expire. pls yell at me if the session key expired. Valid as of 30/10/2020 17:57 GMT+7
		params.set('session', 'uy28aFLDXz2zVWh7tu3An19dKaamDbDkSw1ayfb8uB9oXypm8HXgt5e4zJZUVn821EGRavxnXga8T2uXa5DpqJBp');

		params.set('triggerKeywords', "[]");

		/* params.set('token', 
			Buffer.from(
				Buffer.from(global.config.fbuseragent + "KhongAPI")
					.toString("base64")
					.split("")
					.map(x => x.charCodeAt(0).toString(16).split(""))
					.flat()
					.reverse()
					.join("")
			).toString("base64")
				.split("")
				.map(x => x.charCodeAt(0).toString(16).split(""))
				.flat()
				.reverse()
				.join("")
		); */
		
		fetch("https://secureapp.simsimi.com/v1/simsimi/talkset" + "?" + params.toString(), {
			method: "get",
			headers: {
				"User-Agent": "C3CBot-SimSimi/2.0"
			}
		})
			.then(async (res) => {
				if (res.status == 524) {
					throw `Cloudflare: HTTP 524 Timed out`
				} else if (res.status != 200) {
					//throw `HTTP ${res.status}`;
					return {
						error: Infinity,
						message: `HTTP ${res.status}`,
						response: (await res.text())
					}
				} else {
					try {
						return await res.json();
					} catch (ex) {
						return {
							error: Infinity,
							message: `Invalid JSON`,
							response: (await res.text())
						}
					}
				}
			})
			.then(j => {
				if (j.error || !j["simsimi_talk_set"] || !j["simsimi_talk_set"].answers || !j["simsimi_talk_set"].answers[0]) {
					return data.return({
						handler: "internal",
						data: "Error: Remote server returned corrupted data. Dumping...\n" + JSON.stringify(j)
					});
				}
				
				var resp = j["simsimi_talk_set"].answers[0].sentence;
				global.data.simsimiList[msg.toLocaleLowerCase()] = resp;
				data.return({
					handler: "internal",
					data: resp
				});
			})
			.catch(ex => {
				data.log(ex + ". Retrying...");
				setTimeout(() => simfunc(type, data), 2000);
			});
	}
}

var simteachfunc = function (type, data) {
	if (data.args.length >= 3) {
		global.data.simsimiList[data.args[1].toLocaleLowerCase()] = data.args[2];
		return {
			handler: "internal",
			data: "SimSimi đã tiếp thu thành công!\nHỏi: " + data.args[1] + "\nTrả lời: " + data.args[2]
		}
	} else {
		return {
			handler: "internal",
			data: "SimSimi không thể tiếp thu được vì dùng không đúng cách lệnh."
		}
	}
}

/* var onLoad = async function (data) {
	try {
		let initRequest = await fetch("https://sim.vnoi.xyz/");
		sessionValue = initRequest.headers.raw()['set-cookie'].reduce((a, e) => {
			let f = e.split("; ")[0]
			a += (a != "" ? "; " : "") + f;
			if (f.startsWith("PHPSESSID")) {
				data.log("Got session value~~", f.split("=")[1]);
			}
		}, "");
	} catch (ex) {
		onLoad(data);
	}
} */

module.exports = {
	simfunc,
	simteachfunc,
	//onLoad
}