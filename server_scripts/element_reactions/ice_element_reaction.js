/**
 * 冰元素反应
 * @param {event} event 事件对象
 * @param {string} element 当前元素类型
 * @returns {boolean} 是否发生了反应
 */
function iceElementReaction(event, element) {
    if (element !== 'ice_element') return false;

    const entity = event.entity;
    const attacker = event.source.actual;
    const attackDamage = attacker.getAttribute('minecraft:generic.attack_damage').getValue() | 0;
    const elementalMastery = attacker.getAttribute('kubejs:astral_benediction').getValue() | 0;
    const originalDamage = event.getDamage();

    // 冰 + 火 反应，假设已有处理融化反应的函数
    if (entity.persistentData.contains('fire_element')) {
        handleIceFireMeltReaction(event, originalDamage, elementalMastery);
    }

    // 冰 + 雷 超导反应
    if (entity.persistentData.contains('lightning_element')) {
        handleSuperconductReaction(event, attacker, attackDamage, elementalMastery);
    }

    return false;
}

/**
 * 处理冰与火的融化反应
 * @param {Entity} entity 目标实体
 * @param {number} originalDamage 原始伤害
 * @param {number} elementalMastery 星耀祝福
 * @param {ServerEvent} event 服务器事件
 * @returns {boolean} 是否发生反应
 */
function handleIceFireMeltReaction(event, originalDamage, elementalMastery) {
    const finalDamage = originalDamage * (1.5 * (calculateMasteryBonus(elementalMastery)))
    event.setDamage(finalDamage);

    consumeElement(event, 'fire_element', 200 / 2, 'ice_element');
    return true;
}

/**
 * 处理超导反应(冰+雷)
 * @param {Entity} entity 目标实体 
 * @param {Entity} attacker 攻击者
 * @param {number} attackDamage 攻击伤害
 * @param {number} elementalMastery 星耀祝福
 * @returns {boolean} 是否发生反应
 */
function handleSuperconductReaction(event, attacker, attackDamage, elementalMastery) {
    const PHYSICAL_REDUCTION_KEY = 'physical_resistance_reduction';
    const PHYSICAL_MODIFIED_KEY = 'physical_resistance_modified';
    const entity = event.entity;
    const level = entity.level;
    const pos = entity.position();
    const attackRange = 3

    entity.persistentData.putInt(PHYSICAL_REDUCTION_KEY, 120);
    const aabb = AABB.of(pos.x - attackRange, pos.y - attackRange, pos.z - attackRange, pos.x + attackRange, pos.y + attackRange, pos.z + attackRange);

    // 获取范围内所有实体
    const targets = level.getEntitiesWithin(aabb);

    targets.forEach(target => {
        if (target !== attacker && target.isAlive()) { // 改为排除攻击者
            target.attack(attacker.damageSources().magic(), calculateOverloadDamage(attackDamage, 1.5, elementalMastery));
        }
    });

    if (!entity.persistentData.getBoolean(PHYSICAL_MODIFIED_KEY)) {
        entity.setAttributeBaseValue('kubejs:physical_damage_resist', entity.getAttribute('kubejs:physical_damage_resist').getValue() - 0.6);
        entity.persistentData.putBoolean(PHYSICAL_MODIFIED_KEY, true);
    }

    consumeElement(event, 'lightning_element', 200, 'ice_element');
    return true;
}

// /**
//  * 处理冻结反应(冰+水)
//  * @param {Entity} entity 目标实体
//  * @returns {boolean} 是否发生反应
//  */
// function handleFreezeReaction(entity) {
//     if (!entity.isPlayer()) {
//         // 寒霜抗性层数管理...
//         const currentResistance = entity.persistentData.getInt('frost_resistance') || 0;
//         const newResistance = Math.min(currentResistance + 10, 90);

//         // 计算冻结时间（基础100tick，每层减少10%）
//         const baseDuration = 100;
//         const actualDuration = baseDuration * (1 - 0.01 * newResistance);

//         entity.persistentData.putInt('frost_resistance', newResistance);
//         entity.persistentData.putInt('frost_resistance_duration', actualDuration);
//         entity.setNoAi(true);

//         consumeElement(event, 'water_element', 190, 'ice_element');

//         return true;
//     } else {
//         const currentResistance = entity.persistentData.getInt('frost_resistance') || 0;
//         const newResistance = Math.min(currentResistance + 10, 90);

//         // 计算冻结时间（基础100tick，每层减少10%）
//         const baseDuration = 100;
//         const actualDuration = baseDuration * (1 - 0.01 * newResistance);

//         entity.persistentData.putInt('frost_resistance', newResistance);
//         entity.persistentData.putInt('frost_resistance_duration', actualDuration);

//         entity.potionEffects.add('minecraft:slowness', 10000, 255, false, false);

//         entity.potionEffects.add('minecraft:weakness', 10000, 255, false, false);

//         consumeElement(event, 'water_element', 190, 'ice_element');
//     }
// }