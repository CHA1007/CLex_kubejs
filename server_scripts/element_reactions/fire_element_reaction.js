/**
 * 火元素反应主函数
 * @param {event} event 事件对象
 * @param {string} element 当前元素类型
 * @returns {boolean} 是否发生了反应
 */
function fireElementReaction(event, element) {
    if (element !== 'fire_element') return false;

    const entity = event.entity;
    const attacker = event.source.actual;
    const elementalMastery = attacker.getAttribute('kubejs:astral_benediction').getValue() | 0;
    const attackDamage = attacker.getAttribute('minecraft:generic.attack_damage').getValue() | 0;
    const originalDamage = event.getDamage();

    if (entity.persistentData.contains('catalyze_status')) {
        fireCatalyze(event, attackDamage, elementalMastery);
    }

    if (entity.persistentData.contains('dewspark_layers')) {
        fireDewsparkReaction(event, attackDamage, elementalMastery);
    }

    if (entity.persistentData.contains('lightning_element')) {
        handleOverloadReaction(event, attacker, attackDamage, elementalMastery);
    }

    if (entity.persistentData.contains('water_element')) {
        lowHandleMeltReaction(event, originalDamage, elementalMastery);
    }

    if (entity.persistentData.contains('freeze_element')) {
        fireFreezeReaction(event, originalDamage, elementalMastery,);
    }

    if (entity.persistentData.contains('ice_element')) {
        handleMeltReaction(event, originalDamage, elementalMastery);
    }

    if (entity.persistentData.contains('nature_element')) {
        fireNatureReaction(event, attackDamage, elementalMastery)
    }

    return false;
}


/**
 * 处理蓄露反应（火元素触发蓄露伤害）
 * @param {number} attackDamage 攻击者基础伤害
 * @param {number} originalDamage 原始伤害值
 * @param {number} elementalMastery 元素精通值
 * @param {Event} event 事件对象
 */
function fireDewsparkReaction(event, attackDamage, elementalMastery) {
    const entity = event.entity;
    const layers = entity.persistentData.getInt('dewspark_layers')
    const dewSparkDamage = calculateOverloadDamage(attackDamage, 2.5, elementalMastery) * layers
    let level = entity.level;
    let pos = entity.position();
    let aabb = AABB.of(pos.x - 3, pos.y - 3, pos.z - 3, pos.x + 3, pos.y + 3, pos.z + 3);
    let targets = level.getEntitiesWithin(aabb);
    targets.forEach(target => {
        if (target !== event.player && target.isAlive()) { // 改为排除攻击者
            target.attack(entity.damageSources().magic(), dewSparkDamage);

        } else {
            target.attack(target.damageSources().magic(), dewSparkDamage * 0.05)
        }
    })
    entity.persistentData.remove('dewspark_layers');
    entity.persistentData.remove('dewspark_time');
}

/**
 * 处理融化反应(火+冻)
 * @param {Entity} entity 目标实体
 * @param {number} originalDamage 原始伤害
 * @param {number} elementalMastery 星耀祝福值
 * @param {ServerEvent} event 服务器事件
 * @returns {boolean} 是否发生反应
 */
function fireFreezeReaction(event, originalDamage, elementalMastery) {
    const finalDamage = originalDamage * (2 + calculateMasteryBonus(elementalMastery))
    event.setDamage(finalDamage);

    consumeElement(event, 'freeze_element', 200, 'fire_element');
    return true;
}

/**
 * 处理融化反应(火+冰)
 * @param {Entity} entity 目标实体
 * @param {number} originalDamage 原始伤害
 * @param {number} elementalMastery 星耀祝福值
 * @param {ServerEvent} event 服务器事件
 * @returns {boolean} 是否发生反应
 */
function handleMeltReaction(event, originalDamage, elementalMastery) {
    const finalDamage = originalDamage * (2 * calculateMasteryBonus(elementalMastery))
    event.setDamage(finalDamage);
    consumeElement(event, 'ice_element', 200, 'fire_element');
    return true;
}
/**
 * 处理爆燃反应(火+雷)
 * @param {Entity} entity 目标实体 
 * @param {Entity} attacker 攻击者
 * @param {ServerEvent} event 服务器事件
 * @returns {boolean} 是否发生反应
 */
function handleOverloadReaction(event, attacker, attackDamage, elementalMastery) {
    const entity = event.entity;
    const level = entity.level;
    const pos = entity.position();

    // 创建3格范围的AABB
    const aabb = AABB.of(pos.x - 3, pos.y - 3, pos.z - 3, pos.x + 3, pos.y + 3, pos.z + 3);

    // 获取范围内所有实体
    const targets = level.getEntitiesWithin(aabb);

    targets.forEach(target => {
        if (target !== attacker && target.isAlive()) { // 改为排除攻击者
            target.attack(attacker.damageSources().magic(), calculateOverloadDamage(attackDamage, 2.75, elementalMastery));
        }
    });

    consumeElement(event, 'lightning_element', 200, 'fire_element');
    return true;
}

/**
 * 处理融化反应(火+水)
 * @param {Entity} entity 目标实体
 * @param {Entity} attacker 攻击者
 * @param {number} originalDamage 原始伤害
 * @param {ServerEvent} event 服务器事件
 * @returns {boolean} 是否发生反应
 */
function lowHandleMeltReaction(event, originalDamage, elementalMastery) {
    const finalDamage = originalDamage * (1.5 * (calculateMasteryBonus(elementalMastery)))
    event.setDamage(finalDamage);

    consumeElement(event, 'water_element', 200 / 2, 'fire_element');
    return true;
}
/**
 * 激元素等于草元素
 * @param {Entity} entity 目标实体
 * @param {Entity} attacker 攻击者
 * 
 */
function fireCatalyze(event, attackDamage, elementalMastery) {
    const burnDamage = calculateOverloadDamage(attackDamage, 1.5, elementalMastery)
    event.entity.persistentData.putInt('burn_damage', burnDamage);
    consumeElement(event, 'catalyze_status', 200, 'fire_element');
    return true;
}
/**
 * 处理燃烧反应(火+自然)
 * @param {Entity} entity 目标实体
 * @param {Number} attackDamage 基础伤害
 * @param {Number}  elementalMastery 星耀祝福值
 * @returns {boolean} 是否发生反应
 */
function fireNatureReaction(event, attackDamage, elementalMastery) {
    const burnDamage = calculateOverloadDamage(attackDamage, 1.5, elementalMastery)
    event.entity.persistentData.putInt('burn_damage', burnDamage);
    return true;
}

// /**
//  * 处理湮灭反应(火+末影)
//  * @param {Entity} entity 目标实体
//  * @param {ServerEvent} event 服务器事件
//  * @returns {boolean} 是否发生反应
//  */
// function handleAnnihilationReaction(entity) {
//     const REDUCTION_KEY = 'annihilation_resistance_reduction';
//     const RESIST_MODIFIED_KEY = 'annihilation_resist_modified';

//     // 刷新持续时间
//     entity.persistentData.putInt(REDUCTION_KEY, 120);

//     // 仅在首次触发时执行减抗
//     if (!entity.persistentData.getBoolean(RESIST_MODIFIED_KEY)) {
//         const spellResistValue = entity.getAttribute('irons_spellbooks:spell_resist').getValue();
//         entity.setAttributeBaseValue('irons_spellbooks:spell_resist', spellResistValue - 0.3);
//         entity.persistentData.putBoolean(RESIST_MODIFIED_KEY, true);
//     }

//     // 消耗元素
//     consumeElement(event, 'ender_element', 200, 'fire_element');
//     return true;
// }
