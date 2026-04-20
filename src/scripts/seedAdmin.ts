import { prisma } from "../lib/prisma";
import { userRole } from "../middleware/auth";

async function seedAdmin() {
    try{
        const adminData = {
          name: "Admin",
          email: "yibnazahir@gmail.com",
          password: "Pass123",
          role: userRole.admin,
        };
        const findDuplicateEmail = await prisma.user.findUnique({
          where: {
            email: adminData.email,
          },
        });
        if (findDuplicateEmail) {
          throw new Error ("User Already Exists")
        }
        const signUpAdmin = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            name: adminData.name,
            email: adminData.email,
            role: adminData.role,
            emailVerified: true,
            accounts: {
                create : {
                    id : crypto.randomUUID(),
                    accountId : adminData.email,
                    providerId : "credential",
                    password : adminData.password
                }
            }   
          },
        });
        console.log(signUpAdmin);
    }catch(err){
        console.log(err);
    }

}

seedAdmin()