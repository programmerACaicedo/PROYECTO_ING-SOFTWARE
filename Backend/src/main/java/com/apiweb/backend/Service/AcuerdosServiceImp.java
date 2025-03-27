package com.apiweb.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apiweb.backend.Model.AcuerdosModel;
import com.apiweb.backend.Repository.IAcuerdosRepository;

@Service
public class AcuerdosServiceImp implements IAcuerdosService{
    @Autowired
    private IAcuerdosRepository acuerdosRepository;

    @Override
    public AcuerdosModel guardarAcuerdo(AcuerdosModel acuerdo) {
        return acuerdosRepository.save(acuerdo);
    }
}
