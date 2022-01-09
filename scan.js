/** @param {NS} ns **/
import { scanHosts } from "libscan.js";
export async function main(ns) {
    const hosts = scanHosts(ns, ns.getHostname());
    ns.rm("hosts.js");
    await ns.write("hosts.js", JSON.stringify(hosts, null, 2)); // .js instead of .json because .json not allowed
    ns.alert("scanned " + Object.keys(hosts).length + " hosts, wrote to hosts.js");
}
