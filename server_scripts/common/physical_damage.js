const UN_PHYSICAL_DAMAGE_LIST = [
    'fire_magic',
    'lightning_magic',
    'holy_magic',
    'ice_magic',
    'blood_magic',
    'nature_magic',
    'eldritch_magic',
    'water_magic',
    'ender_magic',
    'onFire',
    'magic',
    'freeze',
    'hotFloor',
    'inFire',
    'drown',
    'fall',
    'fireworks',
    'inWall',
    'indirectMagic',
    'lava',
    'lightningBolt',
    'sonic_boom',
    'starve',
    'wither'
]

/**
 * 物理伤害处理
 * @param {event} event 
 * @returns 
 */
function physicalDamage(event) {
    const attacker = event.source.actual;
    const damageType = event.source.getType();

    if (UN_PHYSICAL_DAMAGE_LIST.includes(damageType)) return false;

    // 获取物理属性
    const damageBoostAttr = attacker ? attacker.getAttribute('kubejs:physical_damage_boost') : null;
    const damageBonus = (damageBoostAttr ? damageBoostAttr.getValue() : 1) - 1; // 补偿默认值

    const resistanceAttr = event.entity.getAttribute('kubejs:physical_damage_resist');
    const targetResistance = (resistanceAttr ? resistanceAttr.getValue() : 1) - 1; // 补偿默认值
    // 计算基础伤害
    const baseDamage = event.getDamage();

    // 应用物理伤害公式
    const finalDamage = calculatePhysicalDamage(baseDamage, damageBonus, targetResistance);
    event.setDamage(finalDamage);

    return true;
}

function calculatePhysicalDamage(baseDamage, damageBonus, resistance) {
    // 应用伤害加成
    const boostedDamage = baseDamage * (1 + (damageBonus * 0.5)); // 调整伤害加成曲线

    // 计算抗性乘数
    let resistanceMultiplier;
    if (resistance < 0) {
        resistanceMultiplier = 1 - (resistance / 2);
    } else if (resistance < 0.75) {
        resistanceMultiplier = 1 - resistance;
    } else {
        resistanceMultiplier = 1 / (1 + 4 * resistance);
    }

    // 计算最终伤害
    const finalDamage = boostedDamage * Math.max(resistanceMultiplier, 0);
    return Math.round(finalDamage * 100) / 100;
}
