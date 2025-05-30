Feature("Richtext basic functional");

Before(({ LabelStudio }) => {
  LabelStudio.setFeatureFlags({
    fflag_feat_front_dev_3873_labeling_ui_improvements_short: true,
  });
});

Scenario("Creating, removing and restoring regions", async ({ I, LabelStudio, AtOutliner, AtRichText }) => {
  I.amOnPage("/");

  LabelStudio.init({
    config: `<View>
    <Labels name="label" toName="html">
        <Label value="Highlight" background="rgb(225,180,0)" />
    </Labels>
    <HyperText name="html" value="$html" />
</View>`,
    data: {
      html: "<div>Hello world!</div>",
    },
    annotations: [
      {
        id: "test",
        result: [
          {
            id: "Highlight_1",
            from_name: "label",
            to_name: "html",
            type: "labels",
            value: {
              start: "/div[1]",
              startOffset: 0,
              end: "/div[1]",
              endOffset: 5,
              labels: ["Highlight"],
            },
          },
        ],
      },
    ],
  });

  LabelStudio.waitForObjectsReady();

  const regionALocator = locate(".htx-highlight").withText("Hello");
  const regionAStyleLocator = locate('style[id^="highlight-Highlight_1"]');
  const regionBLocator = locate(".htx-highlight").withText("world");
  const regionBStyleLocator = locate(
    'style[id^="highlight-"]:not([id^="highlight-Highlight_1"]):not([id="highlight-html"])',
  );

  AtOutliner.seeRegions(1);
  I.say("We have 1 preset region. Let's create another one.");
  I.pressKey("1");
  AtRichText.selectTextByGlobalOffset(6, 11);
  AtOutliner.seeRegions(2);

  within({ frame: ".lsf-richtext__iframe" }, () => {
    I.say("We can see all the regions inside the rich text and their styles in head.");
    I.seeElement(regionALocator);
    I.seeElementInDOM(regionAStyleLocator);
    I.seeElement(regionBLocator);
    I.seeElementInDOM(regionBStyleLocator);
  });

  I.say("Delete all regions");
  I.pressKey(["CommandOrControl", "Backspace"]);
  I.acceptPopup();

  AtOutliner.seeRegions(0);
  within({ frame: ".lsf-richtext__iframe" }, () => {
    I.say("Spans and styles should disappear");
    I.dontSeeElement(regionALocator);
    I.dontSeeElementInDOM(regionAStyleLocator);
    I.dontSeeElement(regionBLocator);
    I.dontSeeElementInDOM(regionBStyleLocator);
  });

  I.say("Go back through the history and check that everything is restored");
  I.pressKey(["CommandOrControl", "z"]);

  within({ frame: ".lsf-richtext__iframe" }, () => {
    I.say("We can see all the regions inside the rich text and their styles in head.");
    I.seeElement(regionALocator);
    I.seeElementInDOM(regionAStyleLocator);
    I.seeElement(regionBLocator);
    I.seeElementInDOM(regionBStyleLocator);
  });
});

Scenario("Region should load after change between annotation tabs", async ({ I, LabelStudio }) => {
  I.amOnPage("/");

  LabelStudio.init({
    config: `<View>
    <Labels name="label" toName="html">
        <Label value="Highlight" background="rgb(225,180,0)" />
    </Labels>
    <HyperText name="html" value="$html" />
</View>`,
    data: {
      html: "<div>Hello world!</div>",
    },
    annotations: [
      {
        id: "1234",
        result: [
          {
            id: "Highlight_1",
            from_name: "label",
            to_name: "html",
            type: "labels",
            value: {
              start: "/div[1]",
              startOffset: 0,
              end: "/div[1]",
              endOffset: 5,
              labels: ["Highlight"],
            },
          },
        ],
      },
      {
        id: "1235",
        result: [
          {
            id: "Highlight_2",
            from_name: "label",
            to_name: "html",
            type: "labels",
            value: {
              start: "/div[1]",
              startOffset: 6,
              end: "/div[1]",
              endOffset: 11,
              labels: ["Highlight"],
            },
          },
        ],
      },
    ],
  });

  LabelStudio.waitForObjectsReady();

  // select second annotation
  I.click(".lsf-annotation-button:nth-child(2)");
  // select first annotation
  I.click(".lsf-annotation-button:nth-child(1)");
  // select second annotation again
  I.click(".lsf-annotation-button:nth-child(2)");
  // check if region is visible
  within({ frame: ".lsf-richtext__iframe" }, () => {
    I.seeElement(locate(".htx-highlight").withText("Hello"));
  });
  // select first annotation again
  I.click(".lsf-annotation-button:nth-child(1)");
  // check if region is visible
  within({ frame: ".lsf-richtext__iframe" }, () => {
    I.seeElement(locate(".htx-highlight").withText("world"));
  });
});

Scenario("Rich text content consistency", async ({ I, LabelStudio, AtOutliner, AtRichText }) => {
  I.amOnPage("/");

  LabelStudio.init({
    config: `<View>
    <Labels name="label" toName="html">
        <Label value="Highlight" background="#617ADA" />
    </Labels>
    <HyperText name="html" value="$html" />
</View>`,
    data: {
      html: "<div>One two three</div>",
    },
    annotations: [
      {
        id: "test",
        result: [],
      },
    ],
  });

  LabelStudio.waitForObjectsReady();
  AtOutliner.seeRegions(0);

  const checkThatRegionsDoNotAffectContent = async (startOffset, endOffset) => {
    within({ frame: ".lsf-richtext__iframe" }, async () => {
      I.seeElement(locate("div").withText("One two three"));
    });

    I.say(`Create region in range [${startOffset},${endOffset}]`);
    I.pressKey("u");
    I.pressKey("1");
    AtRichText.selectTextByGlobalOffset(startOffset, endOffset);
    AtOutliner.seeRegions(1);

    within({ frame: ".lsf-richtext__iframe" }, () => {
      I.seeElement(locate("div").withText("One two three"));
    });

    I.say("Remove region");
    AtOutliner.clickRegion(1);
    I.pressKey("Backspace");
    AtOutliner.seeRegions(0);

    within({ frame: ".lsf-richtext__iframe" }, () => {
      I.seeElement(locate("div").withText("One two three"));
    });

    I.say("Go back through the history");
    I.pressKey(["CommandOrControl", "z"]);

    within({ frame: ".lsf-richtext__iframe" }, () => {
      I.seeElement(locate("div").withText("One two three"));
    });

    I.say("Go forward through the history");
    I.pressKey(["CommandOrControl", "shift", "z"]);

    within({ frame: ".lsf-richtext__iframe" }, () => {
      I.seeElement(locate("div").withText("One two three"));
    });
  };

  checkThatRegionsDoNotAffectContent(0, 3);
  checkThatRegionsDoNotAffectContent(8, 13);
  checkThatRegionsDoNotAffectContent(4, 7);
});
