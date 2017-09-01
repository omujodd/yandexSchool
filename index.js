var dqs = function(s) { return document.querySelector(s) };

MyForm = {
    validate: function() {
        var result = { 'isValid': true, 'errorFields': [] },
            fields = this.getData(),
            approved = ['ya.ru', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'];

        if (fields.fio.split(' ').length != 3) {
            result.errorFields.push('fio');
            result.isValid = false
        }

        if (approved.indexOf(fields.email.substr(fields.email.indexOf('@') + 1)) < 0) {
            result.errorFields.push('email');
            result.isValid = false
        }
        var sum = 0,
            num = fields.phone;
        for (var n = 0; n < num.length; n++) {
            if (num[n].match(/\d/)) { sum += parseInt(num[n]) }
        }

        if (!fields.phone.match(/\+7\(\d{3}\)\d{3}\-\d\d\-\d\d/) || (sum > 30)) {
            result.errorFields.push('phone');
            result.isValid = false
        }

        return result
    },

    getData: function() {
        var fields = dqs('#myForm').children;
        return { 'fio': fields.fio.value, 'email': fields.email.value, 'phone': fields.phone.value }

    },

    setData: function(obj) {
        var fields = dqs('#myForm').children;
        if (obj) {
            if (obj.fio) fields.fio.value = obj.fio;
            if (obj.phone) fields.phone.value = obj.phone;
            if (obj.email) fields.email.value = obj.email
        }
    },
    submit: function() {
        var validateResult = this.validate();
        if (validateResult.isValid) {
            document.querySelectorAll('#myForm .error').forEach(function(i,e){i.className=''});
            dqs('#submitButton').disabled = true;
            var form = dqs('#myForm');
            var data = new FormData(form),
                addr = form.action;

            req = new XMLHttpRequest();
            req.open('POST', addr, true);
            req.send(data);

            req.onreadystatechange = function() {
                if (req.readyState != 4) return;

                if (req.status != 200) {
                    alert(req.status + ': ' + req.statusText);
                } else {
                    var response = JSON.parse(req.responseText);
                    if ((response.status) && (['error', 'success', 'progress'].indexOf(response.status) >= 0)) {
                        var container = dqs('#resultContainer');
                        container.className = response.status;
                        if (response.status == 'error') container.innerHTML += '<p>' + response.reason + '</p>';
                        if (response.status == 'success') container.innerHTML += '<p>Success</p>';
                        if (response.status == 'progress') setTimeout(function() { req.open('POST', addr, true);
                            req.send(data); }, parseInt(response.timeout));
                    }
                }
            }
        } else {
            var fields = dqs('#myForm').children
            for (var e in validateResult.errorFields) {
                fields[validateResult.errorFields[e]].className = 'error';
            }
        }
    }
}


function init() {
    dqs('#submitButton').onclick = function(e) {
        e.preventDefault();
        MyForm.submit();
    }
}

init();