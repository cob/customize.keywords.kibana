//----------------- $kibana  ------------------------
cob.custom.customize.push(function (core, utils, ui) {
    core.customizeAllInstances((instance, presenter) => 
    {
        if (instance.isNew() || presenter.isGroupEdit()) return;

        let iFramesFPs = presenter.findFieldPs((fp) =>
          /[$]kibana\(.+\)/.exec(fp.field.fieldDefinition.description)
        );
        iFramesFPs.forEach((fp) => {
          let matcher = /[$]kibana\(([^,]+),([^,]+)(,([^,]+))??\)/;
          let args = fp.field.fieldDefinition.description.match(matcher);
          let dashboardKibana = args[1];
          let query = args[2];
          let height = args[4] || "300";

          let varsMatcher = /{{(.+)}}/;
          let vars = query.match(varsMatcher);

          for (let i = 1; i < vars.length; i++) {
            let varValue =
              instance.findFields(vars[i]) &&
              instance.findFields(vars[i])[0].value;
            query = query.replaceAll(
              "{{" + vars[i] + "}}",
              '"' + varValue + '"'
            );
          }

          if (
            !$("#" + dashboardKibana).length &&
            !instance.isNew() &&
            !presenter.isGroupEdit()
          ) {
            let $kibana = $(
              '<li id="' +
                dashboardKibana +
                '" style="margin:0;">' +
                "<iframe " +
                'src="/kibana/app/dashboards#/view/' +
                dashboardKibana +
                "?embed=true" +
                "&hide-filter-bar=true" +
                "&_a=(query:(language:lucene,query:'" +
                encodeURI(query) +
                "'))\" " +
                'height="' +
                height +
                '" ' +
                'width="99.6%" style="border: 1px solid lightgray;">' +
                "</iframe>" +
                "</li>"
            );
            fp.content()[0].append($kibana[0]);
          }
        });
    })
});