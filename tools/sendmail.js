const { execSync } = require("child_process");

const arg = require("arg");

const args = arg({
  // Types
  "--help": Boolean,
  "--count": Number,
  "--to": String,
  "--from": String,

  // Aliases
  "-c": "--count",
  "-t": "--to",
  "-f": "--from",
});

console.log(`count: ${args["--count"]}`);
const count = args["--count"];
const to = args["--to"];
const command = `./swaks --to ${to}  -f hirofumi@gmail.com --server localhost -p 2525 -4`;

for (let i = 0; i < count; i++) {
  const stdout = execSync(command);
  console.log(stdout);
}
