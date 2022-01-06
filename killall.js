/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args.length != 1) {
		ns.alert("killall.js: error: expected 1 argument, a host but got " + ns.args.length);
		return;
	}
	ns.killall(ns.args[0]);
}
