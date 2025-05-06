// NeoForge 1.21.1 specific imports
const $RenderType = Java.loadClass("net.minecraft.client.renderer.RenderType");
const Axis = Java.loadClass("com.mojang.math.Axis");
const ResourceLocation = Java.loadClass("net.minecraft.resources.ResourceLocation");
const OverlayTexture = Java.loadClass("net.minecraft.client.renderer.texture.OverlayTexture");
// NeoForge 1.21.1 基础渲染组件
const ELEMENT_CONFIG = {
    fire: { yOffset: 0.5, scale: 0.1 },
    ice: { yOffset: 0.5, scale: 0.1 },
    water: { yOffset: 0.5, scale: 0.1 },
    lightning: { yOffset: 0.5, scale: 0.1 },
    holy: { yOffset: 0.5, scale: 0.1 },
    nature: { yOffset: 0.5, scale: 0.1 },
    ender: { yOffset: 0.5, scale: 0.1 }
};

NativeEvents.onEvent("net.neoforged.neoforge.client.event.RenderLivingEvent$Post", (event) => {
    const { entity, poseStack, multiBufferSource, packedLight } = event;
    if (entity === Client.cameraEntity) return;
    
    // 只渲染距离玩家20格以内的实体 (400是20的平方)
    if (entity.distanceToSqr(Client.cameraEntity) > 400) return;

    const elements = Object.keys(ELEMENT_CONFIG).filter(e =>
        entity.getPersistentData().contains(`${e}_element`)
    );
    if (elements.length === 0) return;

    // 计算每个元素的水平位置
    const spacing = 0.3;
    const startX = -(elements.length - 1) * spacing / 2;

    elements.forEach((element, index) => {
        const config = ELEMENT_CONFIG[element];
        const xOffset = startX + index * spacing;

        // 先整体定位到实体头顶
        poseStack.pushPose();
        poseStack.translate(0, entity.getBbHeight() + 0.5, 0); // 使用最大yOffset

        // 统一应用视角旋转
        const camera = Client.gameRenderer.getMainCamera();
        poseStack.mulPose(Axis.YP.rotationDegrees(-camera.getYRot()));
        // poseStack.mulPose(Axis.XP.rotationDegrees(Client.cameraEntity.getXRot()));

        // 调整间距计算方式（移除缩放补偿）
        const baseSpacing = 0.025; // 基础间距单位
        const spacing = baseSpacing / config.scale; // 自动适配元素自身缩放
        const startX = -(elements.length - 1) * spacing / 2;

        elements.forEach((element, index) => {
            const config = ELEMENT_CONFIG[element];

            poseStack.pushPose();
            poseStack.translate(startX + index * spacing, 0, 0); // 水平平移到对应位置
            poseStack.scale(config.scale, config.scale, config.scale);

            const texture = new ResourceLocation("kubejs", `textures/elements/${element}_element.png`);
            const buffer = multiBufferSource.getBuffer(
                Java.loadClass("net.minecraft.client.renderer.RenderType").entityTranslucent(texture)
            );

            // 基础四边形顶点数据
            const matrix = poseStack.last().pose();
            [
                [-1, 1, 0, 0],
                [1, 1, 1, 0],
                [1, -1, 1, 1],
                [-1, -1, 0, 1]
            ].forEach(([x, y, u, v]) => {
                buffer.addVertex(matrix, x, y, 0.1)
                    .setColor(1, 1, 1, 0.9)
                    .setUv(u, v)
                    .setOverlay(OverlayTexture.NO_OVERLAY)
                    .setLight(packedLight)
                    .setNormal(0, 1, 0);
            });

            poseStack.popPose();
        });
        poseStack.popPose(); // 整体变换结束
    });
});