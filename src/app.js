import express from "express";
import handlebars from "express-handlebars";
import { __dirname } from "./utils.js";
import path from "path";
import { viewRouter } from "./routes/views.routes.js";
import {Server} from "socket.io";

const app = express();
const port = process.env.PORT || 8080;

const httpServer = app.listen(port,()=>console.log(`Server on listening on port ${port}`));

//servidor de websocket
const io = new Server(httpServer);

//middlewares
app.use(express.static(path.join(__dirname,"/public")));

//configuración de handlebars
app.engine('.hbs', handlebars.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname,"/views"));

//routes
app.use(viewRouter);

let messages = [];
//funcion principal del servidor websocket
io.on("connection",(socket)=>{
    console.log(`Nuevo cliente conectado ${socket.id}`);
    socket.on("authenticated",(data)=>{
        socket.emit("messageChat", messages);
        socket.broadcast.emit("newUser", `El usuario ${data.user} se acaba de conectar`);
    });

    socket.on("message",(msgClient)=>{
        messages.push(msgClient);
        io.emit("messageChat", messages);
    });
});