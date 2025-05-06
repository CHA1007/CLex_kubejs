/**
 * 雷元素反应
 * @param {event} event 事件对象
 * @param {string} element 当前元素类型
 * @returns {boolean} 是否发生了反应
 */
function lightningElementReaction(event, element) {
    if (element !== 'lightning_element') return false;

    const entity = event.entity;
    const attacker = event.source.actual;
    const elementalMastery = attacker.getAttribute('kubejs:astral_benediction').getValue() | 0;
    const attackDamage = attacker.getAttribute('minecraft:generic.attack_damage').getValue() | 0;
    const originalDamage = event.getDamage();
    
    if (entity.persistentData.contains('dewspark_layers')) {
        lightningDewsparkReaction(event, attackDamage, elementalMastery);
    }
    if (entity.persistentData.contains('catalyze_status')) {
        lightningCatalyze(event,originalDamage, elementalMastery);
    }
    if (entity.persistentData.contains('fire_element')) {
        lightningFireReaction(event, attacker, attackDamage, elementalMastery);
    }
    if (entity.persistentData.contains('water_element')) {
        electroReaction(event, attackDamage, elementalMastery);
    }
    if (entity.persistentData.contains('freeze_element')) {
        lightningFreezeReaction(event, attacker, attackDamage, elementalMastery);
    }
    if (entity.persistentData.contains('ice_element')) {
        lightningIceReaction(event, attacker, attackDamage, elementalMastery);
    }
    if (entity.persistentData.contains('nature_element')) {
        lightningNatrueReaction(event)
    }
    return false;
}


/**
 * 处理蓄露反应（雷元素触发蓄露伤害）
 * @param {Entity} entity 目标实体
 * @param {number} attackDamage 攻击者基础伤害
 * @param {number} elementalMastery 元素精通值
 * @param {Event} event 事件对象
 */
function lightningDewsparkReaction(event, attackDamage, elementalMastery) {
    const entity = event.entity;
    const layers = entity.persistentData.getInt('dewspark_layers')
    const dewSparkDamage = calculateOverloadDamage(attackDamage, 3, elementalMastery) * layers
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
 * 激化反应伤害加成
 * @param {Entity} entity 目标实体
 * @param {Entity} attacker 攻击者
 * @param {Number} attackDamage 基础伤害
 * @param {Number}  elementalMastery 星耀祝福值
 * @param {ServerEvent} event 服务器事件
 * @returns {boolean} 是否发生反应
 */
function lightningCatalyze(event,originalDamage, elementalMastery) {
    const finalDamage = calculateReactivateDamage(originalDamage, 1.15, elementalMastery)
    event.setDamage(finalDamage);
}
/**
 * 处理爆燃反应(雷+火)
 * @param {Entity} entity 目标实体 
 * @param {Entity} attacker 攻击者
 * @param {ServerEvent} event 服务器事件
 * @returns {boolean} 是否发生反应
 */
function lightningFireReaction(event, attacker, attackDamage, elementalMastery) {
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

    consumeElement(event, 'fire_element', 200, 'lightning_element');
    return true;
}


/**
 * 处理燃烧反应(雷+水)
 * @param {Entity} entity 目标实体
 * @param {Number} attackDamage 基础伤害
 * @param {Number}  elementalMastery 星耀祝福值
 * @returns {boolean} 是否发生反应
 */
function electroReaction(event, attackDamage, elementalMastery) {
    const electroDamage = calculateOverloadDamage(attackDamage, 2, elementalMastery)
    event.entity.persistentData.putInt('electro_damage', electroDamage);
    return true;
}

/**
 * 处理超导反应(雷+冻)
 * @param {Entity} entity 目标实体 
 * @param {Entity} attacker 攻击者
 * @param {number} attackDamage 攻击伤害
 * @param {number} elementalMastery 星耀祝福
 * @returns {boolean} 是否发生反应
 */
function lightningFreezeReaction(event, attacker, attackDamage, elementalMastery) {
    const PHYSICAL_REDUCTION_KEY = 'physical_resistance_reduction';
    const PHYSICAL_MODIFIED_KEY = 'physical_resistance_modified';
    const entity = event.entity;
    const level = entity.level;
    const pos = entity.position();
    const attackRange = 3;
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

    consumeElement(event, 'freeze_element', 200, 'lightning_element');
    return true;
}

/**
 * 处理超导反应(雷+冰)
 * @param {Entity} entity 目标实体 
 * @param {Entity} attacker 攻击者
 * @param {number} attackDamage 攻击伤害
 * @param {number} elementalMastery 星耀祝福
 * @returns {boolean} 是否发生反应
 */
function lightningIceReaction(event, attacker, attackDamage, elementalMastery) {
    const PHYSICAL_REDUCTION_KEY = 'physical_resistance_reduction';
    const PHYSICAL_MODIFIED_KEY = 'physical_resistance_modified';
    const entity = event.entity;
    const level = entity.level;
    const pos = entity.position();
    const attackRange = 3;
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

    consumeElement(event, 'ice_element', 200, 'lightning_element');
    return true;
}

/**
 * 激化反应(雷+草)
 * @param {Entity} entity 目标实体
 */
function lightningNatrueReaction(event) {
    const entity = event.entity;
    entity.persistentData.putInt('catalyze_status', entity.persistentData.getInt('nature_element'))
    consumeElement(event, 'nature_element', 200, 'lightning_element');
    return true;
}
