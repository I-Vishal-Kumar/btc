"use server"
export class USER_SERVICE_SERV {
    static getTest = async () => {
        try {
            
            console.log('called')
            await new Promise((resolve, rejects) => {
                setTimeout(resolve, 1000);
            })
            return {valid: true, data: {}};

        } catch (error) {
            
        }
    }


}
// 1️⃣ Server Action for Login & Signup
// async function authenticateUser(prevState: any, formData: FormData) {
//     const type = formData.get("type"); // login or signup
//     const phone = formData.get("phone")?.toString();
//     const password = formData.get("password")?.toString();
//     const name = formData.get("name")?.toString();
//     const inviteCode = formData.get("inviteCode")?.toString();

//     // 🚀 Simulating API Call (Replace with actual API)
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     if (!phone || !password) return { success: false, error: "Phone & Password required!" };
//     if (type === "signup" && (!name || !inviteCode)) return { success: false, error: "All fields required!" };

//     return { success: true, message: `${ type === "signup" ? "Signup" : "Login" } Successful!` };
// }