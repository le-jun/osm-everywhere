/*
    Firefox addon "OSM Everywhere"
    Copyright (C) 2022  Manuel Reimer <manuel.reimer@gmx.de>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function redirect_google(details) {
  // Check against URL blacklist, first
  if (details.originUrl) {
    const origin = new URL(details.originUrl);
    if (origin.host in URL_BLACKLIST)
      return;
    if (origin.host.startsWith("maps.google"))
      return;
  }

  // Check if required parameters can be found
  if (!details.url.match(/!1i([0-9]+)/))
    return;
  const z = parseInt(RegExp.$1);
  if (!details.url.match(/!2i([0-9]+)/))
    return;
  const x = parseInt(RegExp.$1);
  if (!details.url.match(/!3i([0-9]+)/))
    return;
  const y = parseInt(RegExp.$1);

  // Set up filter
  let filter = browser.webRequest.filterResponseData(details.requestId);
  filter.onstart = async () => {
    filter.write(await stamp_osm_tile(z, x, y));
    filter.close();
  }
}

browser.webRequest.onBeforeRequest.addListener(
  redirect_google,
  {urls: ["https://maps.googleapis.com/maps/vt?pb=*"]},
  ["blocking"]
);
