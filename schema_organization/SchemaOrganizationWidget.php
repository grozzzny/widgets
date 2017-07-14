<?php
namespace grozzzny\widgets\schema_organization;

use yii\base\Widget;

class SchemaOrganizationWidget extends Widget
{
    public $name;
    public $logo;
    public $index;
    public $city;
    public $address;
    public $phone;
    public $email;

    public function run()
    {
        return $this->render('index', [
            'name' => $this->name,
            'logo' => $this->logo,
            'index' => $this->index,
            'city' => $this->city,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
        ]);
    }
}