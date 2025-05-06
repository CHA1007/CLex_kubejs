EntityEvents.beforeHurt(event => {
    // let data = new spellDamageModel()
    if (!isSpellOrMagic(event)) return
    handleElementAttachment(event)
    cancelSpellUnbeatableFrames(event)
    if (event.source.player || event.source.actual === 'mob') {
        let element = ELEMENTS.damageTypes[event.getSource().getType()]
        calculateAttackMultiplier(event)
        // magicalCalculateAttackMultiplier(event, data)
        // calculateDamageBonus(event)
        // spellDamageFix(event)
        // calculateResistanceMultiplierDamage(event)
        fireElementReaction(event, element)
        lightningElementReaction(event, element)
        iceElementReaction(event, element)
        natrueElementReaction(event, element)
        waterElementReaction(event, element)
        calculateCritDamageBonus(event)
        // physicalDamage(event)
        // convertDamageType(event)
        // causeMagicDamage(event, data)
    }
});
EntityEvents.afterHurt(event => {
    if (!isSpellOrMagic(event)) return;

})
ServerEvents.tick(event => {
    tick5HandlePeriodicTasks(event);
    tick10HandlePeriodicTasks(event);
    tick200HandlePeriodicTasks(event);
});


EntityEvents.death(event => {
    const entity = event.entity;
    const elementsToRemove = [
        'fire_element',
        'ice_element',
        'water_element',
        'lightning_element',
        'holy_element',
        'ender_element',
        'nature_element',
        'freeze_status',
        'freeze_element',
        'catalyze_status',
        'dewspark_layers',
        'dewspark_damage',
        'dewspark_time',
    ]; // 可根据实际情况修改此列表
    elementsToRemove.forEach(element => {
        entity.persistentData.remove(element);
    });
});

