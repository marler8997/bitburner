/** @param {NS} ns **/
export async function main(ns) {
    var target = "joesguns";
    var money_threshold = 50000000; // 50M

    if (ns.args.length >= 1) target = ns.args[0];
    if (ns.args.length >= 2) money_threshold = parseMoney(ns.args[1]);
    ns.print("target=" + target + ", money_thresh=" + money_threshold);

    const security_threshold = 10;

    while(true) {
        if (ns.getServerSecurityLevel(target) > security_threshold) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < money_threshold) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}

function parseMoney(str) {
    if (str.endsWith("K")) return parseInt(str) * 1000;
    if (str.endsWith("M")) return parseInt(str) * 1000000;
    if (str.endsWith("B")) return parseInt(str) * 1000000000;
    return parseInt(str);
}
