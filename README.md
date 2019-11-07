# Commit Tagger

仅需几次点击，轻松生成 Angular 风格的规范 commit message。

[GitHub](https://github.com/Mongkii/Commit-Tagger)

[Issue](https://github.com/Mongkii/Commit-Tagger/issues)

## 功能

* 轻轻一点，创建规范的 commit tag

![GIF: add commit tag](images/gif_add_tag.gif)

* 记录和管理使用过的 scope

![GIF: manage scope](images/gif_manage_scope.gif)

## 如何使用

* 在命令面板输入 `Commit Tag` 或点击 Git 面板右上角的标签图标，启动插件

![HELP: start](images/help_start.jpg)

* 选择 commit 类型，再选择影响的 scope
  * 没有 scope？点击“创建新范围”输入一个，所有使用过的 scope 会自动记录在列表里
  ![HELP: create scope](images/help_create_scope.jpg)

  * 想要删除 scope？点击 scope 菜单右上角的垃圾桶
  ![HELP: delete scope](images/help_delete_scope.jpg)

*注：每个 workspace 的 scope 列表是各自独立的*

## 版本信息

### 1.0.1

FIX: 有时选择完 scope 后，菜单不会自动关闭

### 1.0.0

首次发布

## TODO
- [ ] i18n
- [ ] 自定义 commit tag 格式