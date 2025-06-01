# SAIH Cantábtico

- url: 'https://www.chcantabrico.es/sai-sistema-automatico-de-informacion'

- Click on button: ACCESO SAI CH Cantábrico

- url after clicking: https://visor.saichcantabrico.es/

- Find the link with id 'embalses':

```js
await page.waitForSelector(
  'a#embalses > div.icono-lateral-nivel > img.iconos-menu-cambio'
);
await page.click(
  'a#embalses > div.icono-lateral-nivel > img.iconos-menu-cambio'
);

// 3. Hacer clic en "Ver tabla de datos"
await page.waitForSelector(
  'div[title="Ver tabla de datos"] > a.texto-mostrar-tabla'
);
await page.click('div[title="Ver tabla de datos"] > a.texto-mostrar-tabla');
```

- WaitForSelector: table tbody (there are several trs in each section) Good luck!
