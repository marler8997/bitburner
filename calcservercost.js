/** @param {NS} ns **/
export async function main(ns) {
    const ram_align = 9;
    const cost_1_align = 12;

    const server_limit = ns.getPurchasedServerLimit();
    var table = align("RAM", ram_align) + align("Cost for 1", cost_1_align) + "Cost for " + server_limit + "\n";
    const max_ram = ns.getPurchasedServerMaxRam();
    for (var ram = 1; ; ram *= 2) {
        if (ram > max_ram) break;
        const cost = ns.getPurchasedServerCost(ram);
        table += align(ram.toString(), ram_align) + align(toMoney(cost), cost_1_align) + toMoney(cost * server_limit) + "\n";
    }
    ns.alert(table);
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

function align(str, count) {
    if (str.length >= count) return str;
    return str + "_".repeat(count - str.length);
}
