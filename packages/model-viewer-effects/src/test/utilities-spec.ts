/* @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ModelViewerElement } from '@google/model-viewer';
import { ArraysAreEqual, assetPath, CompareArrays, createModelViewerElement, screenshot, timePasses, TypedArray, waitForEvent } from './utilities.js';
import { MVEffectComposer } from '../model-viewer-effects.js';
import { $effectComposer } from '../effect-composer.js';
import { getOwnPropertySymbolValue } from '../utilities.js';
import { Renderer } from '@google/model-viewer/lib/three-components/Renderer.js';
const expect = chai.expect;

suite('Screenshot Baseline Test', () => {
  let element: ModelViewerElement;
  let baseScreenshot: TypedArray<number>;

  setup(async () => {
    element = createModelViewerElement(assetPath('models/Astronaut.glb'));
    await waitForEvent(element, 'load');
  });

  teardown(() => {
    document.body.removeChild(element);
  });

  test('Compare ModelViewer to Self', async () => {
    const renderer = getOwnPropertySymbolValue<Renderer>(element, 'renderer') as Renderer;
    expect(renderer).to.not.be.undefined;
    expect(renderer.threeRenderer).to.not.be.undefined;
    await timePasses(5);
    baseScreenshot = screenshot(element);
    await timePasses(5);
    const screenshot2 = screenshot(element);

    expect(ArraysAreEqual(baseScreenshot, screenshot2)).to.be.true;
  });

  suite('<effect-composer>', () => {
    let composer: MVEffectComposer;
    let composerScreenshot: TypedArray<number>;

    setup(async () => {
      composer = new MVEffectComposer();
      element.insertBefore(composer, element.firstChild);
      await timePasses(5);
    });

    test('Compare Self', async () => {
      const renderer = composer[$effectComposer].getRenderer();
      expect(renderer).to.not.be.undefined;
      await timePasses(5);
      composerScreenshot = screenshot(element);
      await timePasses(5);
      const screenshot2 = screenshot(element);

      expect(ArraysAreEqual(composerScreenshot, screenshot2)).to.be.true;
    });

    test('Compare Against BaseRenderer', () => {
      expect(ArraysAreEqual(baseScreenshot, composerScreenshot)).to.be.false;
      expect(CompareArrays(baseScreenshot, composerScreenshot)).to.be.greaterThan(0.98);
    });
  });
});
