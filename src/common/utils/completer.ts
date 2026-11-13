// Jie. 20250524 实现instance对象的代码提示
const instanceCompleter = {
  // 定义触发字符
  triggerCharacters: ['.'],

  getCompletions: function (editor, session, pos, prefix, callback) {
    const line = session.getLine(pos.row);
    const beforeCursor = line.substring(0, pos.column);

    // 检查是否在注释中
    const isInComment = beforeCursor.includes('//') || beforeCursor.includes('/*');
    if (isInComment) {
      callback(null, []);
      return;
    }

    // 解析当前路径
    const path = beforeCursor.split('.');
    const lastPart = path[path.length - 1];

    // 定义instance对象的方法和属性
    const instanceCompletions = {
      instance: [
        {
          caption: 'formData',
          value: 'formData',
          meta: 'property',
          docText: '表单数据对象',
          type: 'object',
          score: 100,
        },
        {
          caption: 'props',
          value: 'props',
          meta: 'property',
          docText: '组件props对象',
          type: 'object',
          score: 100,
        },
        {
          caption: 'formProps',
          value: 'formProps',
          meta: 'property',
          docText: '表单props对象',
          type: 'object',
          score: 100,
        },
        {
          caption: 'loginStore',
          value: 'loginStore',
          meta: 'property',
          docText: '登录状态管理对象',
          type: 'object',
          score: 100,
        },
        {
          caption: 'ElMessage',
          value: "ElMessage('')",
          meta: 'method',
          docText: 'Element Plus消息提示组件',
          type: 'object',
          score: 100,
        },
        {
          caption: 'router',
          value: 'router',
          meta: 'property',
          docText: '路由对象',
          type: 'object',
          score: 100,
        },
        {
          caption: 'Dialog',
          value: 'Dialog',
          meta: 'property',
          docText: '对话框组件',
          type: 'object',
          score: 100,
        },
        {
          caption: 'showDialog',
          value: 'showDialog',
          meta: 'method',
          docText: '显示对话框方法',
          type: 'function',
          score: 100,
        },
        {
          caption: 'showOnlineDialog',
          value: 'showOnlineDialog',
          meta: 'method',
          docText: '显示在线对话框方法',
          type: 'function',
          score: 100,
        },
        {
          caption: 'getFormWidget',
          value: 'getFormWidget()',
          meta: 'method',
          docText: '获取表单组件实例',
          type: 'function',
          score: 100,
        },
        {
          caption: 'showMessage',
          value: 'showMessage(type, message)',
          meta: 'method',
          docText: '显示消息提示',
          type: 'function',
          score: 100,
        },
        {
          caption: 'close',
          value: 'close()',
          meta: 'method',
          docText: '关闭当前页面',
          type: 'function',
          score: 100,
        },
        {
          caption: 'refresh',
          value: 'refresh()',
          meta: 'method',
          docText: '刷新当前页面',
          type: 'function',
          score: 100,
        },
        {
          caption: 'axios',
          value: 'axios',
          meta: 'property',
          docText: 'axios请求对象，包含post和get方法',
          type: 'object',
          score: 100,
        },
        {
          caption: 'tableInstance',
          value: 'tableInstance',
          meta: 'property',
          docText: '表格实例对象',
          type: 'object',
          score: 100,
        },
      ],
    };

    // 根据当前路径获取对应的提示项
    let completions: Array<{
      caption: string;
      value: string;
      meta: string;
      docText: string;
      type: string;
    }> = [];

    // 先这样吧，以后再优化，可以增加
    completions = instanceCompletions.instance;

    callback(null, completions);
  },
};

// 自定义定义代码片段
const customSnippet = [
  {
    name: 'consl',
    tabTrigger: 'console.log',
    content: `console.log('\${1:message}');`,
  },
  {
    name: 'conserr',
    tabTrigger: 'console.error',
    content: `console.error('\${1:message}');`,
  },
  {
    name: 'select*',
    tabTrigger: 'select',
    content: `select * from \${1:table} where \${2:condition}`,
  },
  {
    name: 'insert*',
    tabTrigger: 'insert',
    content: `insert into \${1:table} (\${2:column1}, \${3:column2}) values (\${4:value1}, \${5:value2})`,
  },
  {
    name: 'update*',
    tabTrigger: 'update',
    content: `update \${1:table} set \${2:column1} = \${3:value1}, \${4:column2} = \${5:value2} where \${6:condition}`,
  },
  {
    name: 'delete*',
    tabTrigger: 'delete',
    content: `delete from \${1:table} where \${2:condition}`,
  },
  {
    name: 'useDbLink*',
    tabTrigger: 'useDbLink',
    content: `api.useDblink('\${1:数据源名称}', true);`,
  },
  {
    name: 'newQueryBuilder*',
    tabTrigger: 'newQueryBuilder',
    content: `var queryBuilder = new ApiQueryBuilder()
    .sql("\${1:sql}")
    .addParams(\${2:params})
    .pageParam(new MyPageParam(\${3:pageNum}, \${4:pageSize}))
    .relations(\${5:relations})
    .dictRelations(\${6:relationDicts});
    `,
  },
  {
    name: 'axiosget*',
    tabTrigger: 'axios.get',
    content: `axios.get('\${1:url}', \${2:params})
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error(err);
    });
    `,
  },
  {
    name: 'axiospost*',
    tabTrigger: 'axios.post',
    content: `axios.post('\${1:url}', \${2:params})
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error(err);
    });
    `,
  },
];

export { instanceCompleter, customSnippet };
