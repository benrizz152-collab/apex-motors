
const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter your new admin password: ", async (password) => {
    if (password.length < 12) {
        console.log("Use a password with at least 12 characters.");
        rl.close();
        return;
    }

    const hash = await bcrypt.hash(password, 12);

    console.log("\nYour password hash is:\n");
    console.log(hash);

    rl.close();
});
