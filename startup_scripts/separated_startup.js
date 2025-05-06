// // 注册女仆施法实体
// StartupEvents.registry('entity_type', event => {
//     event.create('test', 'irons_spells_js:spellcasting')
//         .onCancelledCast(entity => {
//         })
//         // 女仆跳跃时施法
//         .onLivingJump(entity => entity.initiateCastSpell(SpellRegistry.BLOOD_SLASH_SPELL.get(), 1))
//         .onHurt(entity => entity.initiateCastSpell(SpellRegistry.FIRE_BREATH_SPELL.get(), 1))
// })