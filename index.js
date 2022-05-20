const express=require("express");
const app=express();
const server=require("http").Server(app);
const mongo=require("mongodb").MongoClient;
const con="mongodb+srv://sanalthomas:AtLiNOaI57Fu2GnU@sanalcluster.fqtcd.mongodb.net/?retryWrites=true&w=majority";

const io=require("socket.io")(server);

users=[];

PORT=process.env.PORT || 8000;

app.set("view engine","ejs");

io.on("connect",(socket)=>{
 socket.on("user-ready",(data)=>{
 	users[socket.id]=data;
 	socket.emit("current-user",data);
 	 mongo.connect(con,{useUnifiedTopology:true},(err,client)=>{
 	 	if(err) throw err;
 	 	console.log(client);
 		var db=client.db("chatapp");
		db.collection("messages").find({}).toArray(function(err, result) {
			 socket.broadcast.emit("user-join",{messages:result,user:data});
			socket.emit("user-join",{messages:result,user:data});
		})
 	})
 })
 socket.on("message-send",(data)=>{
 	var uid=users[socket.id];
 	mongo.connect(con,{useUnifiedTopology:true},(err,client)=>{
 		var db=client.db("chatapp");
		db.collection("messages").insert({message:data,user:uid});
 	})
	socket.broadcast.emit("message-send",{data:data,user:uid});
	socket.emit("message-send",{data:data,user:uid,users});
})

})

app.get("/",(req,res)=>{
	res.render("home");
})


server.listen(PORT);