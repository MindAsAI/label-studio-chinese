const assert = require("assert");

Feature("Image width parameter").tag("@regress");

const IMAGE = "https://data.heartex.net/open-images/train_0/mini/0030019819f25b28.jpg";

const config = `
  <View>
    <Image name="img" value="$image" width="50%"/>
    <Rectangle name="rect" toName="img"/>
  </View>`;

Scenario(
  "Setting width 50% shouldn't break canvas size on resize of working area",
  async ({ I, LabelStudio, AtImageView, AtOutliner }) => {
    const params = {
      config,
      data: { image: IMAGE },
    };

    I.amOnPage("/");
    LabelStudio.init(params);
    LabelStudio.waitForObjectsReady();
    AtOutliner.seeRegions(0);
    await AtImageView.lookForStage();
    let canvasSize = await AtImageView.getCanvasSize();
    let imageSize = await AtImageView.getImageSize();

    // The sizes of the canvas and image element should be equal (or almost equal)
    assert.strictEqual(Math.ceil(imageSize.width), Math.ceil(canvasSize.width));
    assert.strictEqual(Math.ceil(imageSize.height), Math.ceil(canvasSize.height));

    // Create full-size region
    // This step is just for visual identification of the bug
    AtImageView.drawByDrag(5, 5, canvasSize.width - 10, canvasSize.height - 10);

    I.resizeWindow(800, 900);
    I.resizeWindow(1200, 900);

    canvasSize = await AtImageView.getCanvasSize();
    imageSize = await AtImageView.getImageSize();

    // The sizes should still be equal (or almost equal)
    assert.strictEqual(Math.ceil(imageSize.width), Math.ceil(canvasSize.width));
    assert.strictEqual(Math.ceil(imageSize.height), Math.ceil(canvasSize.height));
  },
);
