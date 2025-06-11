import dotenv from 'dotenv';
dotenv.config();
import { app } from "./app.js"

import connectDB from "./db/db.js";

connectDB()
.then( () => {
    app.listen(process.env.PORT || 3000 ,()=>{
        console.log(`suver is running on ${process.env.PORT}`);
        
    })
})
.catch( (err) => {
    console.log("err from index.js",err);
    
})