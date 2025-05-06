/**
 * 自然元素反应
 * @param {event} event 事件对象
 * @param {string} element 当前元素类型
 * @returns {boolean} 是否发生了反应
 */
function natrueElementReaction(event, element) {
    if (element !== 'nature_element') return false;

    const entity = event.entity;
    const attacker = event.source.actual;
    const elementalMastery = attacker.getAttribute('kubejs:astral_benediction').getValue() | 0;
    const attackDamage = attacker.getAttribute('minecraft:generic.attack_damage').getValue() | 0;
    const originalDamage = event.getDamage();
    if (entity.persistentData.contains('catalyze_status')) {
        natrueCatalyze(event, originalDamage, elementalMastery);
    }
    if (entity.persistentData.contains('fire_element')) {
        natureFireReaction(event, attackDamage, elementalMastery)
    }
    if (entity.persistentData.contains('lightning_element')) {
        natureLightningReaction(event)
    }
    if (entity.persistentData.contains('water_element')) {
        natureWaterReaction(event, attackDamage, elementalMastery)
    }
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
function natrueCatalyze(event, originalDamage, elementalMastery) {
    const finalDamage = calculateReactivateDamage(originalDamage, 1.25, elementalMastery)
    event.setDamage(finalDamage);
}

/**
 * 处理燃烧反应(自然+火)
 * @param {Entity} entity 目标实体
 * @param {Number} attackDamage 基础伤害
 * @param {Number}  elementalMastery 星耀祝福值
 * @returns {boolean} 是否发生反应
 */
function natureFireReaction(event, attackDamage, elementalMastery) {
    const burnDamage = calculateOverloadDamage(attackDamage, 1.5, elementalMastery)
    event.entity.persistentData.putInt('burn_damage', burnDamage);
    return true;
}

/**
 * 激化反应(自然+雷)
 * @param {Entity} entity 目标实体
 */
function natureLightningReaction(event) {
    const entity = event.entity;
    entity.persistentData.putInt('catalyze_status', entity.persistentData.getInt('lightning_element'))
    consumeElement(event, 'lightning_element', 200, 'nature_element');
    return true;
}
/**
 * 蓄露反应（自然+水）
 */
function natureWaterReaction(event, attackDamage, elementalMastery) {
    const entity = event.entity;
    entity.persistentData.putInt('dewspark_time', 120)
    if (entity.persistentData.contains('dewspark_layers')) {
        entity.persistentData.putInt('dewspark_layers', entity.persistentData.getInt('dewspark_layers') + 1)
        entity.persistentData.putInt('dewspark_damage', calculateOverloadDamage(attackDamage, 1, elementalMastery))
    }else{
        entity.persistentData.putInt('dewspark_layers', 1)
        entity.persistentData.putInt('dewspark_damage', calculateOverloadDamage(attackDamage, 1, elementalMastery))
    }
    consumeElement(event, 'water_element', 200, 'nature_element');
}