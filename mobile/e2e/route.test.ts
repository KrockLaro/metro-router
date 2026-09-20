import { by, element, expect, device, waitFor } from 'detox';

describe('Построение маршрута', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('строит маршрут от Фрязино до Одинцово', async () => {
    await element(by.id('from-input')).tap();
    await element(by.id('from-input')).typeText('Фрязино');
    await element(by.text('Фрязино-Пасс.')).tap();

    await element(by.id('to-input')).tap();
    await element(by.id('to-input')).typeText('Одинцово');
    await element(by.text('Одинцово')).tap();

    await element(by.id('build-route-button')).tap();
    await waitFor(element(by.id('route-result')))
      .toBeVisible().withTimeout(15000);

    await expect(element(by.text(/Пересадок:/))).toBeVisible();
  });
});