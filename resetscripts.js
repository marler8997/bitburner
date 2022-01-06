/** @param {NS} ns **/
export async function main(ns) {
	ns.rm("crawldone.txt");
	const pid = await ns.run("crawl.js", 1, "--kill", "--done-file");
	if (pid == 0) {
		ns.alert("failed to start 'crawl.js' with --kill");
		return;
	}
	for (var count = 1; ; count += 1) {
		if (ns.fileExists("crawldone.txt")) {
			ns.run("crawl.js", 1, "--post", "hackhost.js", "joesguns");
			return;
		}
		if (count == 200) {
			ns.alert("crawl.js --kill never wrote the 'crawldone.txt' file");
			return;
		}
		await ns.sleep(10);
	}
}
