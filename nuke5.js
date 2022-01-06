/** @param {NS} ns **/
// Nuke the host
export async function main(ns) {
    if (ns.args.length != 1) {
        ns.alert("nuke5.js: error: expected 1 argument, a host but got " + ns.args.length);
        return;
    }
    const host = ns.args[0];

    const cracks = [
        ns.brutessh,
        ns.ftpcrack,
        ns.relaysmtp,
        ns.httpworm,
        ns.sqlinject,
    ];
    for (var i = 0; i < cracks.length; i++) {
        try { await cracks[i](host); } catch (e) { }
    }
    try { await ns.nuke(host); } catch (e) { }
}

async function tryCrack(crackFunc, host) {
    try { await crackFunc(host) } catch (e) {}
}
