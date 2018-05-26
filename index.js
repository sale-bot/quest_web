const Discord = require("discord.js");
let client = new Discord.Client();
var async = require('async');
client.login("NDE2MDQ4MzgwNjM3MzQ3ODQw.DW-yxQ.NTdDh6NxTT6LmqS79qSuxhdvjOg");

let MainGuild;

client.on('ready', function() {
    MainGuild = client.guilds.get("406057521577721857");
    client.user.setStatus('invisible');
});
client.on('error', error => {client = new Discord.Client()});

setInterval(function() {
    client.user.setStatus('invisible');
},1000 * 20);

const express = require('express');
const app = express();
const mysql = require('mysql');

const dbname = "capp_test",userdat_tablename = "user"
const connection = mysql.createConnection({
  host     : '18.188.157.12',
  user     : 'SaleRead',
  password : 'JKLsjiq995KJklj55lazgHQl',
  database : dbname
});

app.set('view engine', 'pug');
app.use(express.static('views'));

const recordLog = function (req, res, next) {
  console.log('localhost:3000にアクセスしました');
  next();
};

app.use(recordLog);

function ReadMysql(name){
    return new Promise((resolve, reject) => {
        let sql = 'select * from ' + dbname + '.' + name;
        connection.query(sql, (err, rows, fields) => {
            if (err) throw err;
            
            resolve(rows);
        });
    });
}
Exp_Table = [];
app.get('/', function (req, res) {
    ReadMysql("exptable").then(rows=>{
        for(let row = 0;row < rows.length; row++)Exp_Table[row] = rows[row].exp;
        return ReadMysql("user");
    }).then(rows =>{
        let PlayerData = {};//
        MainGuild.fetchMembers().then(guild => {
            async.each(rows, function(p, callback) {
                if(p && p.user_id > 0){
                    const member = guild.members.get(p.user_id);
                    if(member) {
                        PlayerData[p.user_id] = p;
                        const user = member.user;
                        PlayerData[p.user_id].user_name = user.tag;
                        PlayerData[p.user_id].avatarurl = user.displayAvatarURL;
                        PlayerData[p.user_id].at_xp = (PlayerData[p.user_id].lv >= 100 ?
                             "--":(Exp_Table[PlayerData[p.user_id].lv] - PlayerData[p.user_id].xp));
                    }
                    callback();
                }else callback();
            }, function(err){
                if(err) throw err;
                let list = Sort(PlayerData,"lv" ,0 ,true);
                res.render('index', { title: 'node + mysql practice', UserDatas: list});
            });
        });
    });
});
function Sort(sortdata,sortjoken,startrank, r,limit = 100){
	const order = [
		//"name"
		{key: sortjoken, reverse: r},
		{key: "xp_all", reverse: true},
		{key: "user_id", reverse: false}
	];
	function sort_by(list) {
		return (a, b) => {
			for (let i=0; i<list.length; i++) {
				const order_by = list[i].reverse ? 1 : -1;
				if (a[list[i].key] < b[list[i].key]) return order_by;
				if (a[list[i].key] > b[list[i].key]) return order_by * -1;
			}
			return 0;
		};
	}
	let sort = [],counter = 0;
	sort = Object.keys(sortdata).map(function (key) {
		return sortdata[key];
	})
    sort.sort(sort_by(order));

    let rank = 1;
    sort.forEach(function(player) {
        player.rank = rank;
        rank ++;
    });
	return sort.splice(startrank, limit);
}
app.listen(3000);
process.on('unhandledRejection', console.dir);

/*function getQuery() {//クエリ取得
    if(window.location.search === "") return;
    const variables = window.location.search.split("?")[1].split("&");
    const obj = {};
    variables.forEach(function(v, i) {
        const variable = v.split("=");
        obj[variable[0]] = Number(variable[1]);
    });
    return obj;
}*/