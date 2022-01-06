/** @param {NS} ns **/
export async function main(ns) {
    const hosts_text = ns.read("hosts.js");
    if (hosts_text.length == 0) {
        ns.alert("analyze-hosts-for-hack.js: hosts.js does not exist, have you run scan.js?");
        return;
    }
    const hosts = JSON.parse(hosts_text);
    if (typeof hosts != "object") {
        ns.alert("hosts.json did not have an 'object'? It has a: " + typeof hosts);
        return;
    }
    var info_list = [];
    for (const host in hosts) {
        const server_obj = ns.getServer(host);
        info_list.push({host: host, moneyMax: server_obj.moneyMax, requiredHackingSkill: server_obj.requiredHackingSkill});
    }
    info_list.sort(function (a, b) { return b.moneyMax - a.moneyMax; })

    var report = '';
    for (var i = 0; i < info_list.length; i++) {
        const info = info_list[i];
        report += info.host + ": " + toMoney(info.moneyMax) + "   need-hack=" + info.requiredHackingSkill + "\n";
    }
    ns.alert(report);
}

function toMoney(num) {
    if (num < 1000) return num.toFixed(2);
    num /= 1000;
    if (num < 1000) return num.toFixed(2) + " K";
    num /= 1000;
    if (num < 1000) return num.toFixed(2) + " M";
    num /= 1000;
    return num.toFixed(2) + " B";
}
