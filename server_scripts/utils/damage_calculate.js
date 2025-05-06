/**
 * 检查伤害源类型是否为法术类型或魔法类型
 * @param {event} event - 伤害事件
 * @returns {boolean} 如果是法术类型或魔法类型则返回 true，否则返回 false
 */
function isSpellOrMagic(event) {
    let damageSourceType = event.source.getType();
    return global.SPELLTYPES.includes(damageSourceType) || damageSourceType === 'magic';
}

/**
 * 取消法术/魔法伤害的实体无敌帧
 * @param {LivingEntityHurtEvent} event 实体受伤事件对象
 * @returns {void}
 */
function cancelSpellUnbeatableFrames(event) {
    event.entity.invulnerableTime = 0;
}

/**
 * 计算攻击倍率*攻击力
 * @param {event} event 伤害事件
 * @returns {number} 计算后的攻击值
 */
function calculateAttackMultiplier(event) {
    let attackDamageValue = event.source.actual.getAttribute('generic.attack_damage').getValue()
    let spellMultiplier = event.getDamage()
    event.setDamage(attackDamageValue * 3 * (spellMultiplier / 10))
}

/**
 * 计算魔法攻击倍率*攻击力
 * @param {event} event 伤害事件
 * @returns {number} 计算后的攻击值
 */
function magicalCalculateAttackMultiplier(event, data) {
    let attackDamageValue = event.source.actual.getAttribute('generic.attack_damage').getValue()
    let spellMultiplier = event.getDamage()
    // event.cancel()
    return data = attackDamageValue * 3 * (spellMultiplier / 10)
}


/**
 * 计算伤害加成
 * @param {event} event 伤害事件
 * @returns {number} 计算后的总伤害
 */
function calculateDamageBonus(event) {
    let elementalType = ELEMENTS.damageBonus[event.source.getType()]
    let damageBonus = event.source.actual.getAttribute(elementalType).getValue()
    event.setDamage(event.getDamage() * damageBonus)
}

/**
 * 计算暴击爆伤伤害加成
 * @param {event} event 伤害事件
 * @returns {number} 考虑暴击后的总伤害
 */
function calculateCritDamageBonus(event) {
    let baseDamage = event.getDamage();
    let critDamageMultiplier = event.source.actual.getAttribute('apothic_attributes:crit_damage').getValue()
    let isCrit = Math.random() < event.source.actual.getAttribute('apothic_attributes:crit_chance').getValue()
    if (isCrit) {
        return baseDamage * critDamageMultiplier;
    } else {
        return baseDamage;
    }
}

/**
 * 计算抗性乘区伤害
 * @param {event} event 伤害事件
 * @returns {number} 考虑抗性乘区后的伤害
 */
function calculateResistanceMultiplierDamage(event) {
    let elementResist = ELEMENTS.damageResist[event.source.getType()]
    let damageResist = event.source.actual.getAttribute(elementResist).getValue() - 1
    if (damageResist < 0) {
        event.setDamage(event.getDamage() * (1 - damageResist / 2))
    } else if (damageResist >= 0.75) {
        event.setDamage(event.getDamage() * (1 / 1 + 4 * damageResist))
    } else {
        event.setDamage(event.getDamage() * (1 - damageResist))
    }
}

/**
 * 转换伤害类型
 * @event {event} event 伤害事件
 * @returns {string} 转换后的伤害类型
 */
function convertDamageType(event) {
    let attacker = event.source.actual;
    event.entity.attack(attacker.damageSources().magic(), event.getDamage());
    event.cancel()
}

/**
 * 增幅反应增幅倍率
 * @param {number} elementalMastery 星耀祝福
 * @returns {number} 增幅倍率
 */
function calculateMasteryBonus(elementalMastery) {
    return 1 + ((2.78 * elementalMastery) / (elementalMastery + 1400))

}

/**
 * 剧变反应额外伤害
 * @param {number} attackDamage 基础伤害
 * @param {number} reactionMultiplier 反应倍率
 * @param {number} elementalMastery 星耀祝福
 * @returns {number} 额外伤害
 */
function calculateOverloadDamage(attackDamage, reactionMultiplier, elementalMastery) {
    return attackDamage * reactionMultiplier * (1 + (16 * elementalMastery) / (elementalMastery + 2000))

}
/**
 * 激化额外伤害加成
 * @param {number} originalDamage 原始伤害
 * @param {number} reactionMultiplier 反应倍率
 * @param {number} elementalMastery 星耀祝福
 * @returns {number} 额外伤害
 */
function calculateReactivateDamage(originalDamage, reactionMultiplier, elementalMastery) {
    return originalDamage * reactionMultiplier * (1 + (5 * elementalMastery) / (elementalMastery + 1200))

}
/**
 * 处理元素反应附着量消耗
 * @param {LivingEntity} entity 实体对象
 * @param {String} firstHand 先手元素
 * @param {number} elementAmount 元素附着量
 * @param {String} secondHand 后手元素
 * @returns {void}
 */
function consumeElement(event, firstHand, elementAmount, secondHand) {
    let firstHandElement = event.entity.persistentData.getInt(firstHand)

    event.entity.persistentData.putInt(firstHand, Math.max(firstHandElement - elementAmount, 0))
    let id = event.entity.getId();
    event.entity.persistentData.remove(secondHand)
    event.server.sendData(secondHand + '_remove', { entityid: id });
}

/**
 * 魔法伤害结算
 * @param {event} event 伤害事件
 * @param {number} data 伤害值
 * @returns {void}
 */
function causeMagicDamage(event, data) {
    console.log(data)
    event.entity.attack(event.source.actual.damageSources().magic(), data);
}


// /**
//  * 法术伤害机制修复
//  * @param {event} event
//  * @returns
//  *
//  * 此函数处理玩家施加的法术伤害事件，修复法术伤害的计算方式。
//  * 该函数根据玩家的攻击力调整目标实体的受伤害量。
//  */
// function spellDamageFix(event) {
//     const sourceType = event.source.getType();

//     // 检查法术类型和法杖列表
//     if (!global.SPELLTYPES.includes(sourceType) || !global.WANDTYPES) {
//         return;
//     }

//     const attacker = event.source.actual;
//     const currentDamage = event.getDamage();

//     // 检查主手物品是否为法杖
//     const mainHandItem = attacker.getMainHandItem();
//     if (!mainHandItem || !global.WANDTYPES.includes(mainHandItem.getId())) {

//         return;
//     }

//     // 获取攻击力并计算5%增幅
//     const attackAttribute = attacker.getAttribute('generic.attack_damage');
//     const attackDamage = attackAttribute ? Number(attackAttribute.getValue()) || 0 : 0;
//     const damageBonus = currentDamage * 0.05 * attackDamage;
//     const newDamage = currentDamage + damageBonus;

//     event.setDamage(newDamage);
// }
