import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT

async function main() {
    try{
        await prisma.$connect()
        console.log("connected to the prisma successfully");

        app.listen(port, ()=>{
            console.log(`server is running on port ${port}`);
        })
    }
    catch(error)
    {
        console.log("An error occurred", error);
        await prisma.$disconnect()
        process.exit(1)
    }
}

main()