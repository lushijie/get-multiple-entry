/**
* 以下四种规则等价
module.exports = [
  // style1
  {
    'demo/meta/index1': {
      template: 'template.html',
      entry: 'demo/meta/index1.jsx',
      params: {}
    },
  },

  // style2
  {
    'demo/meta/index2': {
      entry: 'demo/meta/index2.jsx',
    },
  },

  // style3
  {
    'demo/meta/index3': 'demo/meta/index3.jsx',
  },

  // style4
  'demo/meta/index4',
];
**/

const path = require('path');

module.exports = function(entryConfig, {
  defaultTemplate = 'template.html',
  templatePrefixPath = '', // template 模块所在位置
  viewPrefixPath = '', // jsx pages 文件所在位置
} = {}) {
  let htmlPluginEntry = [...entryConfig].map((ele) => { // style4
    if (typeof ele === 'string') {
      return {
        [ele]: {
          template: defaultTemplate,
          entry: `${ele}.jsx`,
          params: {}
        }
      }
    } else if (Object.prototype.toString.call(ele) === '[object Object]') {
      const pairs = Object.keys(ele).map(k => [k, ele[k]])[0];
      if (typeof pairs[1] === 'string') { // style3
        return {
          [pairs[0]]: {
            template: defaultTemplate,
            entry: pairs[1],
            params: {}
          }
        }
      } else if (Object.prototype.toString.call(pairs[1]) === '[object Object]') { // style1, style2
        return {
          [pairs[0]]: {
            template:  pairs[1]['template'] || defaultTemplate,
            entry: pairs[1]['entry'],
            params: pairs[1]['params'] || {},
          }
        }
      }
    }
  });

  const webpackEntry = {};
  htmlPluginEntry = htmlPluginEntry.map(ele => {
    const pairs = Object.keys(ele).map(k => [k, ele[k]])[0];
    const key = pairs[0];

    // make webpack entry absolute
    let absoulteEntry = pairs[1].entry;
    if (!path.isAbsolute(absoulteEntry)) {
      absoulteEntry = path.join(viewPrefixPath, absoulteEntry);
    }

    // webpackEntry
    webpackEntry[key] = absoulteEntry;

    // make html template absolute
    let absoluteTemplate = pairs[1].template;
    if (!path.isAbsolute(absoluteTemplate)) {
      absoluteTemplate = path.join(templatePrefixPath, absoluteTemplate);
    }

    return {
      [key]: {
        template: absoluteTemplate,
        entry: absoulteEntry,
        params: pairs[1].params,
      }
    }
  });

  return {
    webpackEntry,
    htmlPluginEntry
  };
}
