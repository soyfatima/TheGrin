import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;

    // Regex to find URLs in the text
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    // Replace URLs with anchor tags, truncating the URL text
    return value.replace(urlPattern, (url) => {
      // Truncate URL to 30 characters or less
      const maxLength = 30;
      const truncatedUrl = url.length > maxLength ? url.substring(0, maxLength) + '...' : url;

      return `<a href="${url}" target="_blank">${truncatedUrl}</a>`;
    });
  }

}
