// This is the old code I used to dynamically call scan.js inside for.js
// However, scan.js requires killing all processes, so I've elected
// to have the user decided when to call it.
	ns.rm("hosts.js");
	const pid = ns.run("scan.js");
	if (pid == 0) {
		ns.alert("run 'scan.js' failed");
		return;
	}
	var hosts = null;
	for (var count = 1; ; count += 1) {
		const hosts_text = ns.read("hosts.js");
		if (hosts_text.length > 0) {
			// TODO: handle SyntaxException
			hosts = JSON.parse(hosts_text);
			if (typeof hosts != "object") {
				ns.alert("hosts.json did not have an 'object'? It has a: " + typeof hosts);
				return;
			}
			break;
		}
		if (count == 200) {
			if (hosts_text.length > 0)
				ns.alert("for.js: scan.js wrote an incomplete 'hosts.js' file: \n" + hosts_text);
			else
				ns.alert("for.js: scan.js never wrote a 'hosts.js' file");
			return;
		}
		await ns.sleep(20);
	}
