/** @param {NS} ns **/
// Nuke the host
export async function main(ns) {
	await ns.nuke(ns.getHostname())
}
